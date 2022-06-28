define profiles::rhel7::oracle_db::db_install {
  # Get the list of software files associated with this version
  $file_list = $profiles::rhel7::oracle_db::databases[$name]['software']
  $db_type = $profiles::rhel7::oracle_db::databases[$name]['type']
  $db_psu_fact = "${profiles::rhel7::oracle_db::db_psu_fact}_${name}"
  $psu_file = dig44($profiles::rhel7::oracle_db::databases, [$name, 'psu', 'file'])

  # Determine if this node is the master or a member
  if $::hostname == $::cluster_master {
    $node_type = 'master'
  } else {
    $node_type = 'member'
  }
  $cluster_nodes = join($profiles::rhel7::oracle_db::cluster_members,',')

  # Get db owner primary group and home directory
  $local_user_data = parsejson($::local_user_info)
  $dbowner_name = $profiles::rhel7::oracle_db::oracle_owner_name
  $dbgroup = dig44($local_user_data, [$dbowner_name, 'group'], 'not_found')
  $dbhome = dig44($local_user_data, [$dbowner_name, 'home'], 'not_found')
  if $dbgroup == 'not_found' or $dbhome == 'not_found' { fail("Could not determine the primary group  and home directory for ${dbowner_name} (db_install)") }

  # Orchestrate the database installation steps
  $root_scripts_fact = "${profiles::rhel7::oracle_db::db_root_scripts_fact}_${name}"

  $search_string = " and (${profiles::rhel7::oracle_db::host_string})"

  $root_scripts_complete_query = foreman({item => 'fact_values', search => "fact=${root_scripts_fact}=true${search_string}", foreman_url => $profiles::rhel7::oracle_db::foreman_url, foreman_user => $profiles::rhel7::oracle_db::foreman_user, foreman_pass => $profiles::rhel7::oracle_db::foreman_pass})

  $root_scripts_results = $root_scripts_complete_query['results']

  if $node_type == 'master' {
    # If we're master but done with PSU we're waiting for members
    # to finish their PSU install.
    if getvar("::${db_psu_fact}") == 'true' {
      $continue = false
      notify { "Waiting for member nodes to complete root scripts and PSU installation (DB ${name}).": }
    # If we get here we still need to either install or run root scripts.
    # The oradb module will determine which.
    } else {
      $continue = true
    }
  } else {
    # If we get here we are waiting for the master node to complete 
    # installation and/or root scripts.
    if size($root_scripts_results) < 1 {
      $continue = false
      notify { "Waiting for master node to complete software installation (${name}) and root scripts.": }
    # If we get here and our PSU has been installed then 
    # we are waiting for other nodes to complete their PSU install.
    } elsif getvar("::${db_psu_fact}") == 'true' {
      $continue = false
      notify { "Waiting for member nodes to complete PSU update.": }
    } else {
      $continue = true
    }
  }

  if $continue == true {
    # Run the database install & root scripts
    oradb::installdb { "Install Oracle Database Software (${name})":
      version                => $name,
      file_data              => $file_list,
      archive_stage_location => $profiles::rhel7::oracle_db::archive_stage_location,
      database_type          => $db_type,
      ora_inventory_dir      => $profiles::rhel7::oracle_db::ora_inventory,
      oracle_base            => $profiles::rhel7::oracle_db::oracle_base,
      oracle_home_prefix     => "${profiles::rhel7::oracle_db::oracle_base}/product",
      bash_profile           => $profiles::rhel7::oracle_db::grid_bash_profile,
      user                   => $dbowner_name,
      user_home_dir          => $dbhome,
      group                  => $dbgroup,
      group_dba              => $profiles::rhel7::oracle_db::db_group_dba,
      group_install          => $profiles::rhel7::oracle_db::db_group_install,
      group_oper             => $profiles::rhel7::oracle_db::db_group_oper,
      group_backup           => $profiles::rhel7::oracle_db::db_group_backup,
      group_dg               => $profiles::rhel7::oracle_db::db_group_dg,
      group_km               => $profiles::rhel7::oracle_db::db_group_km,
      group_rac              => $profiles::rhel7::oracle_db::db_group_rac,
      download_dir           => $profiles::rhel7::oracle_db::software_dir,
      cluster_nodes          => $cluster_nodes,
      node_type              => $node_type,
      fact_file              => $profiles::rhel7::oracle_db::fact_file,
      initial_install_fact   => $profiles::rhel7::oracle_db::db_initial_install_fact,
      root_scripts_fact      => $profiles::rhel7::oracle_db::db_root_scripts_fact,
    }

    # If psu_file is defined indicate that we need to apply it
    if $psu_file != undef {
      file_line { "Setting fact ${db_psu_fact} to false":
        ensure  => present,
        path    => $profiles::rhel7::oracle_db::fact_file,
        line    => "${db_psu_fact}=false",
        match   => "^${db_psu_fact}=",
        replace => true,
        require => Oradb::Installdb["Install Oracle Database Software (${name})"]
      }
    }
  }

  # If there is an opatch file specified attempt to patch it
  $opatch_file = dig44($profiles::rhel7::oracle_db::databases, [$name, 'opatch', 'file'])
  $db_opatch_fact = "${profiles::rhel7::oracle_db::db_opatch_fact}_${name}"
  if $continue == true and $opatch_file != undef {
    # Only if we haven't already done so
    if getvar("::${db_opatch_fact}") != 'true' {
      $opatch_cs = dig44($profiles::rhel7::oracle_db::databases, [$name, 'opatch', 'checksum'])
      $opatch_checksum_type = dig44($profiles::rhel7::oracle_db::databases, [$name, 'opatch', 'checksum_type'])
      if $opatch_cs != undef { 
        $opatch_cs_lower = downcase($opatch_cs)
      }

      oradb::opatchupgrade { "Updating OPatch for Database ${name} install":
        oracle_home            => "${profiles::rhel7::oracle_db::oracle_base}/product/${name}",
        archive_stage_location => $profiles::rhel7::oracle_db::archive_stage_location,
        patch_file             => $opatch_file,
        patch_checksum         => $opatch_cs_lower,
        patch_checksum_type    => $opatch_checksum_type,
        user                   => $dbowner_name,
        group                  => $dbgroup,
        download_dir           => $profiles::rhel7::oracle_db::software_dir,
        require                => Oradb::Installdb["Install Oracle Database Software (${name})"],
      } 
      
      # Set fact indicating we have completed OPatch update
      file_line { "Setting fact ${db_opatch_fact} to true":
        ensure  => present,
        path    => $profiles::rhel7::oracle_db::fact_file,
        line    => "${db_opatch_fact}=true",
        match   => "^${db_opatch_fact}=",
        replace => true,
        require => Oradb::Opatchupgrade["Updating OPatch for Database ${name} install"],
      }
    }

    # Query status of DB OPatch update
    $db_opatch_complete_query = foreman({item => 'fact_values', search => "fact=${db_opatch_fact}=true${search_string}", foreman_url => $profiles::rhel7::oracle_db::foreman_url, foreman_user => $profiles::rhel7::oracle_db::foreman_user, foreman_pass => $profiles::rhel7::oracle_db::foreman_pass})
    $db_opatch_results = $db_opatch_complete_query['results']

    # If all systems have updated OPatch we can proceed
    if size($db_opatch_results) == size($profiles::rhel7::oracle_db::cluster_members) {
      $opatch_ok = true
    } else {
      notify { 'Waiting for all nodes to complete OPatch update.': }
    }
  } else {
    # If we haven't been told to update OPatch we can proceed
    # without regard to its status.
    $opatch_ok = true
  }

  # If we have a PSU to apply and we are OK to proceed, do so
  if $continue == true and $psu_file != undef and $opatch_ok == true {
    # Query status of DB PSU update
    $db_psu_complete_query = foreman({item => 'fact_values', search => "fact=${db_psu_fact}=true${search_string}", foreman_url => $profiles::rhel7::oracle_db::foreman_url, foreman_user => $profiles::rhel7::oracle_db::foreman_user, foreman_pass => $profiles::rhel7::oracle_db::foreman_pass})
    $db_psu_results = $db_psu_complete_query['results']

    # If we're master and OPatch has been applied to all nodes
    # (or not needed) we proceed.
    # Otherwise we have to wait until PSU has been applied
    # to at least one (master) node.
    if $node_type == 'master' or size($db_psu_results) >= 1{
      $go_psu = true
    } else {
      $go_psu = false
      notify { 'Waiting for initial node to install PSU first.': }
    }

    if $go_psu == true {
      $use_opatchauto = dig44($profiles::rhel7::oracle_db::databases, [$name, 'opatch', 'auto'], false)
      $sub_patch_id = dig44($profiles::rhel7::oracle_db::databases, [$name, 'psu', 'sub_patch_id'])
      $sub_patch_folder = dig44($profiles::rhel7::oracle_db::databases, [$name, 'psu', 'sub_patch_folder'])
      $psu_checksum = dig44($profiles::rhel7::oracle_db::databases, [$name, 'psu', 'checksum'])
      $psu_checksum_type = dig44($profiles::rhel7::oracle_db::databases, [$name, 'psu', 'checksum_type'])
      # Apply the patch with OPatch. Always use 'auto' (clusterware=true)
      oradb::opatch { "Apply PSU (${psu_file}) to DB ${name}": 
        oracle_product_home    => "${profiles::rhel7::oracle_db::oracle_base}/product/${name}",
        patch_file             => $psu_file,
        clusterware            => true,
        use_opatchauto_utility => $use_opatchauto,
        bundle_sub_patch_id    => $sub_patch_id,
        bundle_sub_folder      => $sub_patch_folder,
        user                   => $dbowner_name,
        group                  => $dbgroup,
        archive_stage_location => $profiles::rhel7::oracle_db::archive_stage_location,
        archive_checksum       => $psu_checksum,
        archive_checksum_type  => $psu_checksum_type,
        download_dir           => $profiles::rhel7::oracle_db::software_dir,
        require                => File_line["Setting fact ${db_psu_fact} to false"],
      }

      # Set fact indicating we have applied PSU
      file_line { "Setting fact ${db_psu_fact} to true":
        ensure  => present,
        path    => $profiles::rhel7::oracle_db::fact_file,
        line    => "${db_psu_fact}=true",
        match   => "^${db_psu_fact}=",
        replace => true,
        require => Oradb::Opatch["Apply PSU (${psu_file}) to DB ${name}"],
      }
    }
  }
}
