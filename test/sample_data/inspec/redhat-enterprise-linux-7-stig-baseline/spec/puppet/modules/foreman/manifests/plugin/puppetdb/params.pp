# Data for the puppetdb_foreman plugin
class foreman::plugin::puppetdb::params {
  include ::foreman::params

  case $::osfamily {
    'RedHat': {
      case $::operatingsystem {
        'fedora': {
          $package = 'rubygem-puppetdb_foreman'
        }
        default: {
          $package = 'tfm-rubygem-puppetdb_foreman'
        }
      }
    }
    'Debian': {
      $package = 'ruby-puppetdb-foreman'
    }
    'Linux': {
      case $::operatingsystem {
        'Amazon': {
          $package = 'tfm-rubygem-puppetdb_foreman'
        }
        default: {
          fail("${::hostname}: puppetdb_foreman does not support operatingsystem ${::operatingsystem}")
        }
      }
    }
    /^(FreeBSD|DragonFly)$/: {
      # do nothing to not break foreman-installer
    }
    default: {
      fail("${::hostname}: puppetdb_foreman does not support osfamily ${::osfamily}")
    }
  }
  $address           = 'https://localhost:8081/pdb/cmd/v1'
  $dashboard_address = 'http://localhost:8080/pdb/dashboard'
  $ssl_ca_file       = $::foreman::params::client_ssl_ca
  $ssl_certificate   = $::foreman::params::client_ssl_cert
  $ssl_private_key   = $::foreman::params::client_ssl_key
}
