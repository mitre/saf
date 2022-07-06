class profiles::rhel7::oracle_db::grid_install {
  # Determine if this node is the master or a member
  if $::hostname == $::cluster_master {
    $node_type = 'master'
  } else {
    $node_type = 'member'
  }

  # Get grid owner primary group and home directory
  $local_user_data = parsejson($::local_user_info)
  $gridowner_name = $profiles::rhel7::oracle_db::grid_owner_name
  $gridgroup = dig44($local_user_data, [$gridowner_name, 'group'], 'not_found')
  $gridhome = dig44($local_user_data, [$gridowner_name, 'home'], 'not_found')
  if $gridgroup == 'not_found' or $gridhome == 'not_found' { fail("Could not determine the primary group  and home directory for ${gridowner_name} (grid_install)") }

  # Build disk strings for Grid install
  $disk_name_map = $profiles::rhel7::oracle_db::disk_name_map
  $disk_dir = $profiles::rhel7::oracle_db::disk_dir
  $disk_mapping_json = parsejson($::disk_mapping)
  $disk_names = keys($disk_mapping_json)
  $asm_disks = grep($disk_names, $disk_name_map[$profiles::rhel7::oracle_db::grid_disks])
  $asm_disk_string = join(prefix($asm_disks,"${disk_dir}/"),',')
  if $profiles::rhel7::oracle_db::separate_gimr == true {
    $gimr_disks = grep($disk_names, $disk_name_map[$profiles::rhel7::oracle_db::grid_gimr_disks])
    $gimr_disk_string = join(prefix($gimr_disks,"${disk_dir}/"),',')
  } else {
    $gimr_disk_string = undef
  }

  # Orchestrate the Grid installation
  $initial_install_fact = $profiles::rhel7::oracle_db::grid_initial_install_fact
  $root_scripts_fact = $profiles::rhel7::oracle_db::grid_root_scripts_fact

  $search_string = " and (${profiles::rhel7::oracle_db::host_string})"

  $initial_install_complete_query = foreman({item => 'fact_values', search => "fact=${initial_install_fact}=true${search_string}", foreman_url => $profiles::rhel7::oracle_db::foreman_url, foreman_user => $profiles::rhel7::oracle_db::foreman_user, foreman_pass => $profiles::rhel7::oracle_db::foreman_pass})
  $root_scripts_complete_query = foreman({item => 'fact_values', search => "fact=${root_scripts_fact}=true${search_string}", foreman_url => $profiles::rhel7::oracle_db::foreman_url, foreman_user => $profiles::rhel7::oracle_db::foreman_user, foreman_pass => $profiles::rhel7::oracle_db::foreman_pass})

  $initial_install_results = $initial_install_complete_query['results']
  $root_scripts_results = $root_scripts_complete_query['results']

  if $node_type == 'master' {
    # If this condition matches we're wating for member node root scripts to complete
    if getvar("::${root_scripts_fact}") == 'true' and size($root_scripts_results) != size($profiles::rhel7::oracle_db::cluster_members) {
      $continue = false
      notify { 'Waiting for all cluster members to run root scripts before completing installation.': }
    # If we get here it implies that we still have work to do on the master node.
    # The oradb module will detect what that work is.
    } else {
      $continue = true
    }
  } else {
    # If our root scripts have been run but we get here it means we are waiting for
    # the master node to complete post configuration
    if getvar("::${root_scripts_fact}") == 'true' {
      $continue = false
      notify { 'Waiting for master node to complete post installation steps.': }
    # For member nodes we only need to act after the root scripts have been run
    # on the master node. This is indicated by a root script result of at least 1
    } elsif size($root_scripts_results) >= 1 {
      $continue = true
    # If we get here it means that the master node is still performing install
    # and/or root scripts.
    } else {
      $continue = false
      notify { 'Waiting for master node to complete software installation and root scripts.': }
    }
  }

  if $continue == true {
    oradb::installasm { "Install Oracle Grid Infrastructure ${profiles::rhel7::oracle_db::grid_version}":
      version                => $profiles::rhel7::oracle_db::grid_version,
      oracle_archive         => $profiles::rhel7::oracle_db::grid_archive,
      archive_stage_location => $profiles::rhel7::oracle_db::archive_stage_location,
      archive_checksum       => $profiles::rhel7::oracle_db::grid_archive_checksum,
      archive_checksum_type  => $profiles::rhel7::oracle_db::grid_archive_checksum_type,
      grid_type              => $profiles::rhel7::oracle_db::grid_type,
      stand_alone            => $profiles::rhel7::oracle_db::stand_alone,
      grid_base              => $profiles::rhel7::oracle_db::grid_base,
      grid_home              => $profiles::rhel7::oracle_db::grid_home,
      ora_inventory_dir      => $profiles::rhel7::oracle_db::ora_inventory,
      user                   => $gridowner_name,
      user_home_dir          => $gridhome,
      group                  => $gridgroup,
      group_oper             => $profiles::rhel7::oracle_db::grid_group_oper,
      group_asm              => $profiles::rhel7::oracle_db::grid_group_asm,
      group_asmdba           => $profiles::rhel7::oracle_db::grid_group_asmdba,
      download_dir           => $profiles::rhel7::oracle_db::software_dir,
      sys_asm_password       => $profiles::rhel7::oracle_db::sys_asm_password,
      asm_monitor_password   => $profiles::rhel7::oracle_db::asm_monitor_password,
      initial_psu            => $profiles::rhel7::oracle_db::grid_initial_psu,
      psu_checksum           => $profiles::rhel7::oracle_db::grid_psu_checksum,
      psu_checksum_type      => $profiles::rhel7::oracle_db::grid_psu_checksum_type,
      opatch_file            => $profiles::rhel7::oracle_db::grid_opatch_file,
      opatch_checksum        => $profiles::rhel7::oracle_db::grid_opatch_checksum,
      opatch_checksum_type   => $profiles::rhel7::oracle_db::grid_opatch_checksum_type,
      disk_discovery_string  => $profiles::rhel7::oracle_db::disk_dir,
      disk_dg_name           => $profiles::rhel7::oracle_db::grid_disk_dg_name,
      disk_redundancy        => $profiles::rhel7::oracle_db::disk_redundancy,
      disk_au_size           => $profiles::rhel7::oracle_db::grid_disk_au_size,
      disks                  => $asm_disk_string,
      separate_gimr          => $profiles::rhel7::oracle_db::separate_gimr,
      gimr_dg_name           => $profiles::rhel7::oracle_db::grid_gim_dg_name,
      gimr_redundancy        => $profiles::rhel7::oracle_db::grid_gimr_redundancy,
      gimr_au_size           => $profiles::rhel7::oracle_db::grid_gimr_au_size,
      gimr_disks             => $gimr_disk_string,
      cluster_name           => $::cluster_master,
      cluster_members        => $profiles::rhel7::oracle_db::cluster_members,
      scan_name              => "${::cluster_master}-scan",
      scan_port              => $profiles::rhel7::oracle_db::scan_port,
      network_interface_list => $profiles::rhel7::oracle_db::network_interface_list,
      storage_option         => $profiles::rhel7::oracle_db::storage_option,
      bash_profile           => $profiles::rhel7::oracle_db::grid_bash_profile,
      node_type              => $node_type,
      fact_file              => $profiles::rhel7::oracle_db::fact_file,
      initial_install_fact   => $profiles::rhel7::oracle_db::grid_initial_install_fact,
      root_scripts_fact      => $profiles::rhel7::oracle_db::grid_root_scripts_fact,
      post_config_fact       => $profiles::rhel7::oracle_db::grid_post_config_fact,
    }
  }
}
