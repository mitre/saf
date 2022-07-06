class sssd::params {
  case $::osfamily {
    'RedHat': {
      $sssd_conf = '/etc/sssd/sssd.conf'
      $nsswitch_file = '/etc/nsswitch.conf'
      $sssd_pkg = 'sssd'
      $sssd_svc = 'sssd'
      $confd_dir = '/etc/sssd/conf.d'
    }
  }
}
