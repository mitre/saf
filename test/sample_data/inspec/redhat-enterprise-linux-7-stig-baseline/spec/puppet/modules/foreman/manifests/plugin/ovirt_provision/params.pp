# Data for the ovirt_provision plugin
class foreman::plugin::ovirt_provision::params {
  case $::osfamily {
    'RedHat': {
      case $::operatingsystem {
        'fedora': {
          $package = 'rubygem-ovirt_provision_plugin'
        }
        default: {
          $package = 'tfm-rubygem-ovirt_provision_plugin'
        }
      }
    }
    'Debian': {
      $package = 'ruby-ovirt-provision-plugin'
    }
    'Linux': {
      case $::operatingsystem {
        'Amazon': {
          $package = 'tfm-rubygem-ovirt_provision_plugin'
        }
        default: {
          fail("${::hostname}: ovirt_provision_plugin does not support operatingsystem ${::operatingsystem}")
        }
      }
    }
    /^(FreeBSD|DragonFly)$/: {
      # do nothing to not break foreman-installer
    }
    default: {
      fail("${::hostname}: ovirt_provision_plugin does not support osfamily ${::osfamily}")
    }
  }
}
