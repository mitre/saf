class yum::params {
  case $::osfamily {
    'RedHat': {
      $yum_conf                 = '/etc/yum.conf'
    }
  }

}
