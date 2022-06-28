class krb5_client::params {
  case $::osfamily {
    'RedHat': {
      $krb5_config = '/etc/krb5.conf'
      $krb5_client_pkg = 'krb5-workstation'
      $default_log = 'file:/var/log/krb5.log'
      $default_cache = 'FILE:/tmp/krb5cc_%{uid}'
      $allow_weak_crypto = 'false'
      $dns_lookup_realm = 'true'
      $dns_lookup_kdc = 'true'
      $ticket_lifetime = '8h'
      $renew_lifetime = '1d'
      $rdns = 'false'
      $forwardable = 'yes'
    }
  }
}
