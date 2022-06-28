class vmware_gugent::params {
  case $::osfamily {
    'RedHat': {
      $pkg_name = 'gugent'
      $trust_cert = '/etc/pki/ca-trust/source/anchors/katello-server-ca.pem'
      $install_path = '/usr/share/gugent'
    }
  }
}
