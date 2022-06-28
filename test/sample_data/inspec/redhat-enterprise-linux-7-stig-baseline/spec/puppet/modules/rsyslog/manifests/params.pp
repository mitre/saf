class rsyslog::params {
  case $::osfamily {
    'RedHat': {
      $purge_excludes  = ['listen.conf']
      $confd_dir       = '/etc/rsyslog.d'
      $conf_file       = '/etc/rsyslog.conf'
      $conf_file_mode  = '0644'
      $svc_name        = 'rsyslog'
      $pkg_name        = 'rsyslog'
      $multi_value_list= ['$ModLoad','$IncludeConfig']
    }
  }
}
