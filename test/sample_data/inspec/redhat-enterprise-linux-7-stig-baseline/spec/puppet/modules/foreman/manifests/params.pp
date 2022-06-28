# The foreman default parameters
class foreman::params {
  $lower_fqdn = downcase($::fqdn)

# Basic configurations
  $foreman_url      = "https://${lower_fqdn}"
  $foreman_user     = undef
  $foreman_password = undef
  # Should foreman act as an external node classifier (manage puppet class
  # assignments)
  $enc            = true
  # Should foreman receive reports from puppet
  $reports        = true
  # Should foreman receive facts from puppet
  $receive_facts  = true
  # should foreman manage host provisioning as well
  $unattended     = true
  # Enable users authentication (default user:admin pw:changeme)
  $authentication = true
  # configure foreman via apache and passenger
  $passenger      = true
  # Enclose apache configuration in <VirtualHost>...</VirtualHost>
  $use_vhost      = true
  # Server name of the VirtualHost
  $servername     = $::fqdn
  # Server aliases of the VirtualHost
  $serveraliases  = [ 'foreman' ]
  # force SSL (note: requires passenger)
  $ssl            = true
  #define which interface passenger should listen on, undef means all interfaces
  $passenger_interface = undef
  # further passenger parameters
  $passenger_prestart = true
  $passenger_min_instances = 1
  $passenger_start_timeout = 600
  # Choose whether you want to enable locations and organizations.
  $locations_enabled     = false
  $organizations_enabled = false

  # Additional software repos
  $configure_epel_repo      = ($::osfamily == 'RedHat' and $::operatingsystem != 'Fedora')
  # Only configure extra SCL repos on EL
  $configure_scl_repo       = ($::osfamily == 'RedHat' and $::operatingsystem != 'Fedora')

# Advanced configuration - no need to change anything here by default
  # if set to true, no repo will be added by this module, letting you to
  # set it to some custom location.
  $custom_repo       = false
  # this can be stable, or nightly
  $repo              = 'stable'
  $railspath         = '/usr/share'
  $app_root          = "${railspath}/foreman"
  $plugin_config_dir = '/etc/foreman/plugins'
  $manage_user       = true
  $user              = 'foreman'
  $group             = 'foreman'
  $user_groups       = ['puppet']
  $rails_env         = 'production'
  $gpgcheck          = true
  $version           = 'present'
  $plugin_version    = 'present'

  $puppetmaster_timeout = 60
  $puppetmaster_report_timeout = 60

  # when undef, foreman-selinux will be installed if SELinux is enabled
  # setting to false/true will override this check (e.g. set to false on 1.1)
  $selinux     = undef

  # if enabled, will install and configure the database server on this host
  $db_manage   = true
  # Database 'production' settings
  $db_type     = 'postgresql'
  $db_username = 'foreman'
  # Generate and cache the password on the master once
  # In multi-puppetmaster setups, the user should specify their own
  $db_password = cache_data('foreman_cache_data', 'db_password', random_password(32))
  # Default database connection pool
  $db_pool = 5
  # if enabled, will run rake jobs, which depend on the database
  $db_manage_rake = true

  # Configure foreman email settings (database or email.yaml)
  $email_config_method       = 'file'
  $email_conf                = 'email.yaml'
  $email_source              = 'email.yaml.erb'
  $email_delivery_method     = undef
  $email_smtp_address        = undef
  $email_smtp_port           = 25
  $email_smtp_domain         = undef
  $email_smtp_authentication = 'none'
  $email_smtp_user_name      = undef
  $email_smtp_password       = undef

  # OS specific paths
  case $::osfamily {
    'RedHat': {
      $init_config = '/etc/sysconfig/foreman'
      $init_config_tmpl = 'foreman.sysconfig'
      $puppet_etcdir = '/etc/puppet'
      $puppet_home = '/var/lib/puppet'

      case $::operatingsystem {
        'fedora': {
          $puppet_basedir  = '/usr/share/ruby/vendor_ruby/puppet'
          $yumcode = "f${::operatingsystemrelease}"
          $passenger_ruby = undef
          $passenger_ruby_package = undef
          $plugin_prefix = 'rubygem-foreman_'
        }
        default: {
          $osreleasemajor = regsubst($::operatingsystemrelease, '^(\d+)\..*$', '\1')
          $yumcode = "el${osreleasemajor}"
          $puppet_basedir = $osreleasemajor ? {
            '6'     => regsubst($::rubyversion, '^(\d+\.\d+).*$', '/usr/lib/ruby/site_ruby/\1/puppet'),
            default => '/usr/share/ruby/vendor_ruby/puppet',
          }
          # add passenger::install::scl as EL uses SCL on Foreman 1.2+
          $passenger_ruby = '/usr/bin/tfm-ruby'
          $passenger_ruby_package = 'tfm-rubygem-passenger-native'
          $plugin_prefix = 'tfm-rubygem-foreman_'
        }
      }
    }
    'Debian': {
      $puppet_basedir  = '/usr/lib/ruby/vendor_ruby/puppet'
      $puppet_etcdir = '/etc/puppet'
      $puppet_home = '/var/lib/puppet'
      $passenger_ruby = '/usr/bin/foreman-ruby'
      $passenger_ruby_package = undef
      $plugin_prefix = 'ruby-foreman-'
      $init_config = '/etc/default/foreman'
      $init_config_tmpl = 'foreman.default'
    }
    'Linux': {
      case $::operatingsystem {
        'Amazon': {
          $puppet_basedir = regsubst($::rubyversion, '^(\d+\.\d+).*$', '/usr/lib/ruby/site_ruby/\1/puppet')
          $puppet_etcdir = '/etc/puppet'
          $puppet_home = '/var/lib/puppet'
          $yumcode = 'el6'
          # add passenger::install::scl as EL uses SCL on Foreman 1.2+
          $passenger_ruby = '/usr/bin/tfm-ruby'
          $passenger_ruby_package = 'tfm-rubygem-passenger-native'
          $plugin_prefix = 'tfm-rubygem-foreman_'
          $init_config = '/etc/sysconfig/foreman'
          $init_config_tmpl = 'foreman.sysconfig'
        }
        default: {
          fail("${::hostname}: This module does not support operatingsystem ${::operatingsystem}")
        }
      }
    }
    'Suse': {
      $puppet_basedir = "" regsubst($::rubyversion, '^(\d+\.\d+).*$', '/usr/lib/ruby/vendor_ruby/\1/puppet')
      $puppet_etcdir = '/etc/puppetlabs/puppet'
      $puppet_home = '/var/lib/puppet'
    }
    'Archlinux': {
      $puppet_basedir = regsubst($::rubyversion, '^(\d+\.\d+).*$', '/usr/lib/ruby/vendor_ruby/\1/puppet')
      $puppet_etcdir = '/etc/puppetlabs/puppet'
      $puppet_home = '/var/lib/puppet'
    }
    /^(FreeBSD|DragonFly)$/: {
      $puppet_basedir = regsubst($::rubyversion, '^(\d+\.\d+).*$', '/usr/local/lib/ruby/site_ruby/\1/puppet')
      $puppet_etcdir = '/usr/local/etc/puppet'
      $puppet_home = '/var/puppet'
    }
    'windows': {
      $puppet_basedir = undef
      $puppet_etcdir = undef
      $puppet_home = undef
      $yumcode = undef
      $passenger_ruby = undef
      $passenger_ruby_package = undef
      $plugin_prefix = undef
    }
    default: {
      fail("${::hostname}: This module does not support osfamily ${::osfamily}")
    }
  }
  $puppet_user = 'puppet'
  $puppet_group = 'puppet'

  if versioncmp($::puppetversion, '4.0') < 0 {
    $aio_package = false
  } elsif $::osfamily == 'Windows' or $::rubysitedir =~ /\/opt\/puppetlabs\/puppet/ {
    $aio_package = true
  } else {
    $aio_package = false
  }

  $puppet_ssldir = $aio_package ? {
    true    => '/etc/puppetlabs/puppet/ssl',
    default => "${puppet_home}/ssl"
  }

  # If CA is specified, remote Foreman host will be verified in reports/ENC scripts
  $client_ssl_ca   = "${puppet_ssldir}/certs/ca.pem"
  # Used to authenticate to Foreman, required if require_ssl_puppetmasters is enabled
  $client_ssl_cert = "${puppet_ssldir}/certs/${lower_fqdn}.pem"
  $client_ssl_key  = "${puppet_ssldir}/private_keys/${lower_fqdn}.pem"

  $vhost_priority = '05'

  # Set these values if you want Passenger to serve a CA-provided cert instead of puppet's
  $server_ssl_ca    = "${puppet_ssldir}/certs/ca.pem"
  $server_ssl_chain = "${puppet_ssldir}/certs/ca.pem"
  $server_ssl_cert  = "${puppet_ssldir}/certs/${lower_fqdn}.pem"
  $server_ssl_certs_dir = '' # lint:ignore:empty_string_assignment - this must be empty since we override a default
  $server_ssl_key   = "${puppet_ssldir}/private_keys/${lower_fqdn}.pem"
  $server_ssl_crl   = "${puppet_ssldir}/crl.pem"

  # We need the REST API interface with OAuth for some REST Puppet providers
  $oauth_active = true
  $oauth_map_users = false
  $oauth_consumer_key = cache_data('foreman_cache_data', 'oauth_consumer_key', random_password(32))
  $oauth_consumer_secret = cache_data('foreman_cache_data', 'oauth_consumer_secret', random_password(32))

  # Initial admin account details
  $admin_username = 'admin'
  $admin_password = cache_data('foreman_cache_data', 'admin_password', random_password(16))
  $admin_first_name = undef
  $admin_last_name = undef
  $admin_email = undef

  # Initial taxonomies
  $initial_organization = undef
  $initial_location = undef

  $ipa_authentication = false
  $http_keytab = '/etc/httpd/conf/http.keytab'
  $pam_service = 'foreman'
  $ipa_manage_sssd = true

  # Websockets
  $websockets_encrypt = true
  $websockets_ssl_key = $server_ssl_key
  $websockets_ssl_cert = $server_ssl_cert

  # Application logging
  $logging_level = 'info'
  $loggers = {}

  # Starting puppet runs with foreman
  $puppetrun = false

  # KeepAlive settings of Apache
  $keepalive              = true
  $max_keepalive_requests = 100
  $keepalive_timeout      = 5

  # Default ports for Apache to listen on
  $server_port     = 80
  $server_ssl_port = 443

}
