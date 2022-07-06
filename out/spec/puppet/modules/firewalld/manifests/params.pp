class firewalld::params {
  case $::osfamily {
    'RedHat': {
      $pkg_name     = 'firewalld'
      $svc_name     = 'firewalld'
      $service_dir  = '/etc/firewalld/services'
      $reload_cmd   = '/usr/bin/firewall-cmd --reload'
    }
  }
}
