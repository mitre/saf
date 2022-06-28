# Parameters for Foreman CLI class
class foreman::cli::params {
  $foreman_url = undef
  $version = 'installed'
  $manage_root_config = true
  $username = undef
  $password = undef
  $refresh_cache = false
  $request_timeout = 120
  $ssl_ca_file = undef

  # OS specific paths
  case $::osfamily {
    'RedHat': {
      case $::operatingsystem {
        'fedora': {
          $hammer_plugin_prefix = 'rubygem-hammer_cli_'
        }
        default: {
          $hammer_plugin_prefix = 'tfm-rubygem-hammer_cli_'
        }
      }
    }
    'Debian': {
      $hammer_plugin_prefix = 'ruby-hammer-cli-'
    }
    'Linux': {
      case $::operatingsystem {
        'Amazon': {
          $hammer_plugin_prefix = 'tfm-rubygem-hammer_cli_'
        }
        default: {
          fail("${::hostname}: This module does not support operatingsystem ${::operatingsystem}")
        }
      }
    }
    /(ArchLinux|Suse)/: {
      $hammer_plugin_prefix = undef
    }
    /^(FreeBSD|DragonFly)$/: {
      $hammer_plugin_prefix = undef
    }
    'windows': {
      $hammer_plugin_prefix = undef
    }
    default: {
      fail("${::hostname}: This module does not support osfamily ${::osfamily}")
    }
  }
}
