# Run a Foreman rake task when notified
define foreman::rake(
  $environment = {},
  $timeout     = undef,
  $user        = $::foreman::user,
  $app_root    = $::foreman::app_root,
) {
  validate_hash($environment)

  # https://github.com/rodjek/puppet-lint/issues/327
  # lint:ignore:arrow_alignment
  exec { "foreman-rake-${title}":
    command     => "/usr/sbin/foreman-rake ${title}",
    user        => $user,
    environment => sort(join_keys_to_values(merge({'HOME' => $app_root}, $environment), '=')),
    logoutput   => 'on_failure',
    refreshonly => true,
    timeout     => $timeout,
  }
  # lint:endignore
}
