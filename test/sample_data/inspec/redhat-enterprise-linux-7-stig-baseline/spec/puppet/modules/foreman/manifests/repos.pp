# Set up a repository for foreman
define foreman::repos(
  $repo = stable,
  $gpgcheck = true
) {
  include ::foreman::params

  case $::osfamily {
    'RedHat': {
      foreman::repos::yum {$name:
        repo     => $repo,
        yumcode  => $::foreman::params::yumcode,
        gpgcheck => $gpgcheck,
      }
    }
    'Debian': {
      foreman::repos::apt {$name:
        repo => $repo,
      }
    }
    'Linux': {
      case $::operatingsystem {
        'Amazon': {
          foreman::repos::yum {$name:
            repo     => $repo,
            yumcode  => $::foreman::params::yumcode,
            gpgcheck => $gpgcheck,
          }
        }
        default: {
          fail("${::hostname}: This module does not support operatingsystem ${::operatingsystem}")
        }
      }
    }
    default: {
      fail("${::hostname}: This module does not support osfamily ${::osfamily}")
    }
  }
}
