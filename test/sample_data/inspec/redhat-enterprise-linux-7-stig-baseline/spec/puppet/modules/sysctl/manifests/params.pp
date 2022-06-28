class sysctl::params {

  case $::osfamily {
    'RedHat': {
      $sysctl_config = '/etc/sysctl.conf'
      $sysctl_d_dir = '/etc/sysctl.d'
      $sysctl_suffix = '.conf'
      $sysctl_pkg_name = 'initscripts'
      $reload_cmd = '/usr/sbin/sysctl --system'
      $system_max_priority = 50
    }
    default: {
      $sysctl_config = '/etc/sysctl.conf'
      $syscctl_d_dir = undef
      $sysctl_pkg_name = 'initscripts'
      $sysctl_suffix = '.conf'
      $reload_cmd = '/usr/sbin/sysctl --system'
      $system_max_priority = 50
    }
  }
}
