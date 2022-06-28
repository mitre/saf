# Installs the package for a given Foreman plugin
define foreman::plugin(
  $version     = $foreman::plugin_version,
  $package     = "${foreman::plugin_prefix}${title}",
  $config_file = "${foreman::plugin_config_dir}/foreman_${title}.yaml",
  $config      = undef,
) {
  # Debian gem2deb converts underscores to hyphens
  case $::osfamily {
    'Debian': {
      $real_package = regsubst($package,'_','-','G')
    }
    default: {
      $real_package = $package
    }
  }
  package { $real_package:
    ensure => $version,
  }

  if $config {
    file { $config_file:
      ensure  => file,
      owner   => 'root',
      group   => 'root',
      mode    => '0644',
      content => $config,
      require => Package[$real_package],
    }
  }
}
