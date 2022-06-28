# Configure foreman
class foreman::config {
  # Ensure 'puppet' user group is present before managing foreman user
  # Relationship is duplicated there as defined() is parse-order dependent
  if defined(Class['puppet::server::install']) {
    Class['puppet::server::install'] -> Class['foreman::config']
  }

  concat::fragment {'foreman_settings+01-header.yaml':
    target  => '/etc/foreman/settings.yaml',
    content => template('foreman/settings.yaml.erb'),
    order   => '01',
  }

  concat {'/etc/foreman/settings.yaml':
    owner => 'root',
    group => $::foreman::group,
    mode  => '0640',
  }

  file { '/etc/foreman/database.yml':
    owner   => 'root',
    group   => $::foreman::group,
    mode    => '0640',
    content => template('foreman/database.yml.erb'),
  }

  if $::foreman::email_delivery_method and !empty($::foreman::email_delivery_method) {
    if $::foreman::email_config_method == 'file' {
      file { "/etc/foreman/${foreman::email_conf}":
        ensure  => file,
        owner   => 'root',
        group   => $::foreman::group,
        mode    => '0640',
        content => template("foreman/${foreman::email_source}"),
      }
    } else {
      file { "/etc/foreman/${foreman::email_conf}":
        ensure => absent,
      }
    }
  }

  file { $::foreman::init_config:
    ensure  => file,
    content => template("foreman/${foreman::init_config_tmpl}.erb"),
  }

  file { $::foreman::app_root:
    ensure  => directory,
  }

  if $::foreman::manage_user {
    user { $::foreman::user:
      ensure  => 'present',
      shell   => '/bin/false',
      comment => 'Foreman',
      home    => $::foreman::app_root,
      gid     => $::foreman::group,
      groups  => $::foreman::user_groups,
    }
  }

  # remove crons previously installed here, they've moved to the package's
  # cron.d file
  cron { ['clear_session_table', 'expire_old_reports', 'daily summary']:
    ensure  => absent,
  }

  if $::foreman::passenger  {
    class { '::foreman::config::passenger': } -> anchor { 'foreman::config_end': }

    if $::foreman::ipa_authentication {
      if !defined('$default_ipa_server') or empty($::default_ipa_server) or !defined('$default_ipa_realm') or empty($::default_ipa_realm) {
        fail("${::hostname}: The system does not seem to be IPA-enrolled")
      }

      if $::foreman::selinux or (str2bool($::selinux) and $::foreman::selinux != false) {
        selboolean { 'allow_httpd_mod_auth_pam':
          persistent => true,
          value      => 'on',
        }

        # Prior to RHEL 6.6, httpd_dbus_sssd is unavailable
        exec { 'setsebool httpd_dbus_sssd':
          command => '/usr/sbin/setsebool -P httpd_dbus_sssd on',
          onlyif  => '/usr/sbin/getsebool httpd_dbus_sssd',
          unless  => '/usr/sbin/getsebool httpd_dbus_sssd | grep \'on$\'',
        }
      }

      if $::foreman::ipa_manage_sssd {
        service { 'sssd':
          ensure  => running,
          enable  => true,
          require => Package['sssd-dbus'],
        }
      }

      file { "/etc/pam.d/${foreman::pam_service}":
        ensure  => file,
        owner   => root,
        group   => root,
        mode    => '0644',
        content => template('foreman/pam_service.erb'),
      }

      exec { 'ipa-getkeytab':
        command => "/bin/echo Get keytab \
          && KRB5CCNAME=KEYRING:session:get-http-service-keytab kinit -k \
          && KRB5CCNAME=KEYRING:session:get-http-service-keytab /usr/sbin/ipa-getkeytab -s ${::default_ipa_server} -k ${foreman::http_keytab} -p HTTP/${::fqdn} \
          && kdestroy -c KEYRING:session:get-http-service-keytab",
        creates => $::foreman::http_keytab,
      }
      -> file { $::foreman::http_keytab:
        ensure => file,
        owner  => apache,
        mode   => '0600',
      }

      ::foreman::config::passenger::fragment { 'intercept_form_submit':
        ssl_content => template('foreman/intercept_form_submit.conf.erb'),
      }

      ::foreman::config::passenger::fragment { 'lookup_identity':
        ssl_content => template('foreman/lookup_identity.conf.erb'),
      }

      ::foreman::config::passenger::fragment { 'auth_kerb':
        ssl_content => template('foreman/auth_kerb.conf.erb'),
      }


      if $::foreman::ipa_manage_sssd {
        $sssd_services = ensure_value_in_string($::sssd_services, ['ifp'], ', ')

        $sssd_ldap_user_extra_attrs = ensure_value_in_string($::sssd_ldap_user_extra_attrs, ['email:mail', 'lastname:sn', 'firstname:givenname'], ', ')

        $sssd_allowed_uids = ensure_value_in_string($::sssd_allowed_uids, ['apache', 'root'], ', ')

        $sssd_user_attributes = ensure_value_in_string($::sssd_user_attributes, ['+email', '+firstname', '+lastname'], ', ')

        augeas { 'sssd-ifp-extra-attributes':
          context => '/files/etc/sssd/sssd.conf',
          changes => [
            "set target[.=~regexp('domain/.*')]/ldap_user_extra_attrs '${sssd_ldap_user_extra_attrs}'",
            "set target[.='sssd']/services '${sssd_services}'",
            'set target[.=\'ifp\'] \'ifp\'',
            "set target[.='ifp']/allowed_uids '${sssd_allowed_uids}'",
            "set target[.='ifp']/user_attributes '${sssd_user_attributes}'",
          ],
          notify  => Service['sssd'],
        }
      }

      concat::fragment {'foreman_settings+02-authorize_login_delegation.yaml':
        target  => '/etc/foreman/settings.yaml',
        content => template('foreman/settings-external-auth.yaml.erb'),
        order   => '02',
      }
    }
  }
}
