class sshd::params {
  case $::osfamily {
    'RedHat': {
      $sshd_config = '/etc/ssh/sshd_config'
      $svc_name = 'sshd'
      $sshd_pkg_name = 'openssh-server'
      $priv_key_mode = '0600'
      $pub_key_mode = '0644'
      $lens = 'sshd.lns'
    }
  }
}
