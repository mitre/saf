class ssh_client::params {

  case $::osfamily {
    'RedHat': {
      $ssh_client_config = '/etc/ssh/ssh_config'
      $ssh_pkg_name = 'openssh-clients'
    }
  }
}
