# oracle_db main class
class profiles::rhel7::oracle_db (
  $groups                     = {},
  $oracle_owner,
  $grid_owner,
  $foreman_user               = 'fact_viewer',
  $foreman_pass,
  $foreman_url,
  $required_packages          = [],
  $sysctl_name                = 'oracle',
  $sysctl_priority            = 90,
  $kernel_settings            = {},
  $public_zone                = 'public',
  $private_zone               = 'trusted',
  $asm_priv_combined          = false,
  $firewall_services,         
  $ifcfg_lens                 = 'shellvars.lns',
  $fs_mounts                  = {},
  $limits                     = [],
  $umask                      = '022',
  $user_info_fact_name        = 'local_user_info',
  $ssh_host_keys_fact_name    = 'ssh_host_keys',
  $disk_dir                   = '/dev/oracleasm',
  $disk_dir_mode              = '0755',
  $disk_mode                  = '0660',
  $u01_dirs                   = {},
  $pub_net_settings           = {},
  $priv_net_settings          = {},
  $trust_members              = true,
  $preconfigure_only          = true,
  $fact_file                  = '/etc/facter/facts.d/oracle_facts.txt',
  $puppet_conf                = undef,
  $puppet_deploy_interval     = '2m',
  $em_dir                     = '/u01/app/EM',
  $ora_inventory              = '/u01/app/oraInventory',
  $grid_home                  = '/u01/app/12.2.0/grid',
  $oracle_base                = '/u01/app/oracle',
  $grid_base                  = '/u01/app/oragrid',
  $software_dir               = '/u01/app/software',
  $grid_version               = '12.2.0.1',
  $archive_stage_location     = undef,
  $grid_archive               = undef,
  $grid_archive_checksum      = undef,
  $grid_archive_checksum_type = undef,
  $grid_type                  = 'CRS_CONFIG',
  $stand_alone                = true, # in case of 'CRS_SWONLY' and used as stand alone or in RAC
  $grid_group_oper,
  $grid_group_asm,
  $grid_group_asmdba,
  $sys_asm_password,
  $asm_monitor_password,
  $grid_initial_psu           = undef,
  $grid_psu_checksum          = undef,
  $grid_psu_checksum_type     = undef,
  $grid_opatch_file           = undef,
  $grid_opatch_checksum       = undef,
  $grid_opatch_checksum_type  = undef,
  $disk_redundancy            = 'NORMAL',
  $grid_disk_dg_name          = 'CRS',
  $grid_disk_au_size          = 4,
  $grid_disks                 = 'crs',
  $separate_gimr              = true,
  $grid_gimr_dg_name          = 'MGMT',
  $grid_gimr_redundancy       = undef,
  $grid_gimr_au_size          = undef,
  $grid_gimr_disks            = 'mgmt',
  $scan_port                  = undef,
  $network_interface_list     = undef,
  $storage_option             = undef,
  $grid_bash_profile          = true,
  $disk_name_map              = { 'mgmt' => 'MGMT[0-9]{2}',
                                  'log'  => 'LOG[0-9]{2}',
                                  'redo' => 'REDO[0-9]{2}',
                                  'data' => 'DATA[0-9]{2}',
                                  'crs'  => 'CRS[0-9]{2}',
                                },
  $databases                  = {},
  $db_group_dba               = 'dba',
  $db_group_install           = 'dba',
  $db_group_oper              = 'dba',
  $db_group_backup            = 'dba',
  $db_group_dg                = 'dba',
  $db_group_km                = 'dba',
  $db_group_rac               = 'dba',
  $preconfig_fact             = 'preconfig_complete',
  $grid_initial_install_fact  = 'grid_initial_install_complete',
  $grid_root_scripts_fact     = 'grid_root_scripts_complete',
  $grid_post_config_fact      = 'grid_post_install_complete',
  $db_initial_install_fact    = 'db_initial_install_complete',
  $db_root_scripts_fact       = 'db_root_scripts_complete',
  $db_opatch_fact             = 'db_opatch_updated',
  $db_psu_fact                = 'db_psu_applied',
  # Hugepages disabled by default
  $minimum_hugepages          = 0,
  $minimum_memlock            = 3145728,
  $cv_instances               = {},
) {
  validate_hash($groups)
  validate_hash($oracle_owner)
  validate_hash($grid_owner)
  validate_hash($kernel_settings)
  validate_hash($u01_dirs)
  validate_hash($pub_net_settings)
  validate_hash($priv_net_settings)
  validate_hash($databases)
  validate_array($required_packages)
  validate_array($limits)
  validate_bool($trust_members)
  validate_bool($preconfigure_only)
  validate_integer($minimum_hugepages)
  validate_integer($minimum_memlock)
  validate_hash($cv_instances)

  if $puppet_conf != undef {
    $puppet_config = $puppet_conf
  } else {
    if versioncmp('4',$::clientversion) > 0 {
      $puppet_config = '/etc/puppet/puppet.conf'
    } else {
      $puppet_config = '/etc/puppetlabs/puppet/puppet.conf'
    }
  }
  
  $grid_owner_names = keys($grid_owner)
  $oracle_owner_names = keys($oracle_owner)
  if size($grid_owner_names) > 1 { fail('Only one Grid owner can be specified') }
  if size($oracle_owner_names) > 1 { fail('Only one Oracle owner can be specified') }
  $grid_owner_name = $grid_owner_names[0]
  $oracle_owner_name = $oracle_owner_names[0]


  $cluster_members = split("${::cluster_master},${::cluster_members}",',')

  # Fetch host info from Foreman
  $host_string = join(suffix(prefix($cluster_members,'host='),".${::domain}"),' or ')
  $foreman_user_info = foreman({item => 'fact_values', search => "fact=${user_info_fact_name} and (${host_string})", foreman_url => $foreman_url, foreman_user => $foreman_user, foreman_pass => $foreman_pass})
  $foreman_host_keys = foreman({item => 'fact_values', search => "fact=${ssh_host_keys_fact_name} and (${host_string})", foreman_url => $foreman_url, foreman_user => $foreman_user, foreman_pass => $foreman_pass})

  contain profiles::rhel7::oracle_db::os_config
  contain profiles::rhel7::oracle_db::networking
  contain profiles::rhel7::oracle_db::storage
  if size($cv_instances) > 0 { create_resources('cv_agent::agent_instance', $cv_instances) }

  # If this host is the cluster master execute
  # software installation(s)
  if $preconfigure_only == false {
    if $archive_stage_location == undef { fail('An archive download location ($archive_stage_location) is required for Oracle installation.') }

    # Perform queries for our installation status
    $pre_config_complete_query = foreman({item => 'fact_values', search => "fact=${preconfig_fact}=true and (${host_string})", foreman_url => $foreman_url, foreman_user => $foreman_user, foreman_pass => $foreman_pass})
    $pre_config_results = $pre_config_complete_query['results']
    $grid_post_config_complete_query = foreman({item => 'fact_values', search => "fact=${grid_post_config_fact}=true and (${host_string})", foreman_url => $foreman_url, foreman_user => $foreman_user, foreman_pass => $foreman_pass})
    $grid_post_config_results = $grid_post_config_complete_query['results']
    # For DB root scripts search with a wildcard since multiple version can exist
    $db_root_scripts_complete_query = foreman({item => 'fact_values', search => "fact~${db_root_scripts_fact}%=true and (${host_string})", foreman_url => $foreman_url, foreman_user => $foreman_user, foreman_pass => $foreman_pass})
    $db_root_scripts_results = $db_root_scripts_complete_query['results']
    # Check if we have any systems needing to apply PSU
    $db_psu_required_query = foreman({item => 'fact_values', search => "fact~${db_psu_fact}%=false and (${host_string})", foreman_url => $foreman_url, foreman_user => $foreman_user, foreman_pass => $foreman_pass})
    $db_psu_required_results = $db_psu_required_query['results']

    # Create list of database versions to install
    $db_versions = keys($databases)
     
    # Now we count all of the root scripts that are complete
    $all_root_scripts_list = values($db_root_scripts_results)
    $root_scripts_run = count_items_in_array_of_hashes($all_root_scripts_list)

    # If the db_psu_fact is set and is 'false' it means we need to 
    # patch and it is not yet complete. 
    if size($db_psu_required_results) > 0 {
      contain profiles::rhel7::oracle_db::complete_preconfig
      Class['profiles::rhel7::oracle_db::complete_preconfig'] ->
      profiles::rhel7::oracle_db::db_install { $db_versions: }
      $next_stage = Class['profiles::rhel7::oracle_db::complete_preconfig']
    # If we've completed #versions x #members we are done
    } elsif $root_scripts_run >= (size($db_versions) * size($cluster_members)) {
      contain profiles::rhel7::oracle_db::restore_runinterval
      $next_stage = Class['profiles::rhel7::oracle_db::restore_runinterval']
    # Otherwise, if grid_post_config is complete we need to begin
    # (or continue) the database installation.
    } elsif size($grid_post_config_results) >= 1 {
      # We include the complete_preconfig class here (again)
      # to ensure that we are using the smaller convergence run
      # interval. 
      contain profiles::rhel7::oracle_db::complete_preconfig
      Class['profiles::rhel7::oracle_db::complete_preconfig'] ->
      profiles::rhel7::oracle_db::db_install { $db_versions: }
      $next_stage = Class['profiles::rhel7::oracle_db::complete_preconfig']
    # If grid is not complete see if preconfig is complete. If
    # so start or continue grid install.
    } elsif size($pre_config_results) == size($cluster_members) {
      contain profiles::rhel7::oracle_db::grid_install
      $next_stage = Class['profiles::rhel7::oracle_db::grid_install']
    # If none of the above notify that we are waiting for prereqs to complete
    } else {
      contain profiles::rhel7::oracle_db::complete_preconfig
      $next_stage = Class['profiles::rhel7::oracle_db::complete_preconfig']
      $next_stage ->
      notify { 'Waiting for cluster members to complete initial configuration.': }
    }

    Class['profiles::rhel7::oracle_db::os_config',
          'profiles::rhel7::oracle_db::networking',
          'profiles::rhel7::oracle_db::storage']
    ->
    $next_stage
  }
}
