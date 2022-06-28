# Configure the foreman repo
class foreman::repo(
  $custom_repo         = $::foreman::custom_repo,
  $repo                = $::foreman::repo,
  $gpgcheck            = $::foreman::gpgcheck,
  $configure_epel_repo = $::foreman::configure_epel_repo,
  $configure_scl_repo  = $::foreman::configure_scl_repo,
) {
  anchor { 'foreman::repo::begin': }

  if ! $custom_repo {
    Anchor['foreman::repo::begin']
    -> foreman::repos { 'foreman':
      repo     => $repo,
      gpgcheck => $gpgcheck,
    }
    -> Class['::foreman::repos::extra']
  }

  Anchor['foreman::repo::begin']
  -> class { '::foreman::repos::extra':
    configure_epel_repo => $configure_epel_repo,
    configure_scl_repo  => $configure_scl_repo,
  }
  -> anchor { 'foreman::repo::end': }
}
