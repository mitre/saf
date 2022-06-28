# Configure the foreman service
class foreman::service(
  $passenger = $::foreman::passenger,
  $app_root  = $::foreman::app_root,
  $ssl       = $::foreman::ssl,
) {
  anchor { ['foreman::service_begin', 'foreman::service_end']: }

  if $passenger {
    exec {'restart_foreman':
      command     => "/bin/touch ${app_root}/tmp/restart.txt",
      refreshonly => true,
      cwd         => $app_root,
      path        => '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    }

    # Anchor httpd service within this service class, but allow other
    # configuration within the apache module to occur before
    Anchor['foreman::service_begin'] -> Service['httpd']
    Class['::apache'] -> Anchor['foreman::service_end']

    # Ensure SSL certs from the puppetmaster are available
    # Relationship is duplicated there as defined() is parse-order dependent
    if $ssl and defined(Class['puppet::server::config']) {
      Class['puppet::server::config'] -> Class['foreman::service']
    }

    $service_ensure = 'stopped'
    $service_enabled = false
  } else {
    $service_ensure  = 'running'
    $service_enabled = true
  }

  service {'foreman':
    ensure    => $service_ensure,
    enable    => $service_enabled,
    hasstatus => true,
  }
}
