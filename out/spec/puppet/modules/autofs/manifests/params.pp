class autofs::params {

  case $::osfamily {
    'RedHat': {
      $master_map     = '/etc/auto.master'
      $map_dir        = '/etc/auto.master.d'
      $svc_name       = 'autofs'
      $pkg_name       = 'autofs'
    }
  }
}
