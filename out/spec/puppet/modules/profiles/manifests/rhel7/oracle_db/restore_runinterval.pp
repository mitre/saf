class profiles::rhel7::oracle_db::restore_runinterval {
  $runinterval = $profiles::rhel7::oracle_db::puppet_deploy_interval
  file_line { "Removing modified runinterval from Puppet config (${runinterval})":
    ensure            => absent,
    path              => $profiles::rhel7::oracle_db::puppet_config,
    match             => "\s*runinterval\s*=\s*${runinterval}",
    match_for_absence => true,
  } ->
  # Set fact to inform that runinterval has been restored
  file_line { 'Setting fact runinterval_restored to true':
    ensure  => present,
    path    => $profiles::rhel7::oracle_db::fact_file,
    line    => 'runinterval_restored=true',
    match   => '^runinterval_restored=',
    replace => true,
  }
}
