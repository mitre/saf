# Class to decrease the runinterval of Puppet to speed up
# convergence
class profiles::rhel7::oracle_db::complete_preconfig {
  $runinterval = $profiles::rhel7::oracle_db::puppet_deploy_interval
  # Increase the Puppet agent run frequency to speed up
  # the convergence time for the deployment.
  # It appears that if the Puppet agent is running it will
  # automatically detect changes to its config file and reload.
  augeas { "Set Puppet runinterval for deployment (${runinterval}->${profiles::rhel7::oracle_db::puppet_config})":
    incl    => $profiles::rhel7::oracle_db::puppet_config,
    lens    => 'puppet.lns',
    changes => "set agent/runinterval ${runinterval}",
  } ->
  # Set fact to inform that runinterval is modified
  file_line { "Setting fact runinterval_restored to false":
    ensure  => present,
    path    => $profiles::rhel7::oracle_db::fact_file,
    line    => "runinterval_restored=false",
    match   => '^runinterval_restored=',
    replace => true,
  }

  # Ensure that we have converged with our SSH authorized keys
  # before proceeding
  # Create a list of hashes without respect to the hosts they're on
  $user_lists = values($profiles::rhel7::oracle_db::foreman_user_info['results'])
  $grid_owner_name = $profiles::rhel7::oracle_db::grid_owner_name
  $oracle_owner_name = $profiles::rhel7::oracle_db::oracle_owner_name
  $grid_tmp_user = dig44($profiles::rhel7::oracle_db::grid_owner, [$grid_owner_name, 'tempuser'], 'not_found')
  $oracle_tmp_user = dig44($profiles::rhel7::oracle_db::oracle_owner, [$oracle_owner_name, 'tempuser'], 'not_found')

  # If the temp user(s) are found locally we can proceed with them
  # Otherwise, we'll assume they've already been removed and we need
  # to use the actual users.
  $local_user_info=parsejson(getvar("::${profiles::rhel7::oracle_db::user_info_fact_name}"))
  if has_key($local_user_info, $grid_tmp_user) {
    $grid_name = $grid_tmp_user
  } else {
    $grid_name = $grid_owner_name
  }

  if has_key($local_user_info, $oracle_tmp_user) {
    $oracle_name = $oracle_tmp_user
  } else {
    $oracle_name = $oracle_owner_name
  }

  $grid_key_count = count_dig_values($user_lists, [$profiles::rhel7::oracle_db::user_info_fact_name, $grid_name, 'key', 'value'])
  $oracle_key_count = count_dig_values($user_lists, [$profiles::rhel7::oracle_db::user_info_fact_name, $oracle_name, 'key', 'value'])
  $target_count = size($profiles::rhel7::oracle_db::cluster_members)

  if $grid_key_count == $target_count and $oracle_key_count == $target_count {
    # Set fact to inform that preconfig is complete
    file_line { "Setting fact ${profiles::rhel7::oracle_db::preconfig_fact} to true":
      ensure  => present,
      path    => $profiles::rhel7::oracle_db::fact_file,
      line    => "${profiles::rhel7::oracle_db::preconfig_fact}=true",
      match   => "^${profiles::rhel7::oracle_db::preconfig_fact}=",
      replace => true,
      require => File_line["Setting fact runinterval_restored to false"],
    }
  } else {
    notify { 'Waiting for all oracle user SSH keys to be generated and reported.':
      require => File_line["Setting fact runinterval_restored to false"],
    }
  }
}
