# Install the needed packages for foreman
class foreman::install {

  case $::foreman::db_type {
    'sqlite': {
      case $::osfamily {
        'Debian': { $package = 'foreman-sqlite3' }
        default:  { $package = 'foreman-sqlite' }
      }
    }
    'postgresql': {
      $package = 'foreman-postgresql'
    }
    'mysql': {
      $package = 'foreman-mysql2'
    }
    default: {
      fail("${::hostname}: unknown database type ${::foreman::db_type}")
    }
  }

  package { $package:
    ensure  => $::foreman::version,
  }

  if $::foreman::selinux or (str2bool($::selinux) and $::foreman::selinux != false) {
    package { 'foreman-selinux':
      ensure => $::foreman::version,
    }
  }

  if $::foreman::passenger and $::foreman::passenger_ruby_package {
    package { $::foreman::passenger_ruby_package:
      ensure  => installed,
      require => Class['apache'],
      before  => Class['apache::service'],
    }
  }

  if $::foreman::ipa_authentication {
    case $::osfamily {
      'RedHat': {
        # The apache::mod's need to be in install to break circular dependencies
        ::apache::mod { 'authnz_pam': package => 'mod_authnz_pam' }
        ::apache::mod { 'intercept_form_submit': package => 'mod_intercept_form_submit' }
        ::apache::mod { 'lookup_identity': package => 'mod_lookup_identity' }
        include ::apache::mod::auth_kerb
      }
      default: {
        fail("${::hostname}: ipa_authentication is not supported on osfamily ${::osfamily}")
      }
    }

    if $::foreman::ipa_manage_sssd {
      package { 'sssd-dbus':
        ensure => installed,
      }
    }
  }
}
