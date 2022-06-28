# Manage your foreman server
#
# === Parameters:
#
# $admin_username::             Username for the initial admin user
#                               type:String
#
# $admin_password::             Password of the initial admin user, default is randomly generated
#                               type:String
#
# $admin_first_name::           First name of the initial admin user
#                               type:Optional[String]
#
# $admin_last_name::            Last name of the initial admin user
#                               type:Optional[String]
#
# $admin_email::                E-mail address of the initial admin user
#                               type:Optional[String]
#
# $db_manage::                  if enabled, will install and configure the database server on this host
#                               type:Boolean
#
# $db_type::                    Database 'production' type
#                               type:Enum['mysql', 'postgresql', 'sqlite']
#
# $email_delivery_method::      Email delivery method
#                               type:Optional[Enum['sendmail', 'smtp']]
#
# $email_smtp_address::         SMTP server hostname, when delivery method is SMTP
#                               type:Optional[String]
#
# $email_smtp_port::            SMTP port
#                               type:Integer[0, 65535]
#
# $email_smtp_domain::          SMTP HELO domain
#                               type:Optional[String]
#
# $email_smtp_authentication::  SMTP authentication method
#                               type:Enum['none', 'plain', 'login', 'cram-md5']
#
# $email_smtp_user_name::       Username for SMTP server auth, if authentication is enabled
#                               type:Optional[String]
#
# $email_smtp_password::        Password for SMTP server auth, if authentication is enabled
#                               type:Optional[String]
#
# $locations_enabled::          Enable locations?
#                               type:Boolean
#
# $organizations_enabled::      Enable organizations?
#                               type:Boolean
#
# $initial_organization::       Name of an initial organization
#                               type:Optional[String]
#
# $initial_location::           Name of an initial location
#                               type:Optional[String]
#
# $ipa_authentication::         Enable configuration for external authentication via IPA
#                               type:Boolean
#
# $puppetrun::                  Should Foreman be able to start Puppet runs on nodes
#                               type:Boolean
#
# === Advanced parameters:
#
# $email_source::               Template to use for email configuration file
#                               type:String
#
# $foreman_url::                URL on which foreman is going to run
#                               type:Stdlib::HTTPUrl
#
# $unattended::                 Should Foreman manage host provisioning as well
#                               type:Boolean
#
# $authentication::             Enable user authentication. Initial credentials are set using admin_username
#                               and admin_password.
#                               type:Boolean
#
# $passenger::                  Configure foreman via apache and passenger
#                               type:Boolean
#
# $passenger_ruby::             Ruby interpreter used to run Foreman under Passenger
#                               type:Optional[String]
#
# $passenger_ruby_package::     Package to install to provide Passenger libraries for the active Ruby
#                               interpreter
#                               type:Optional[String]
#
# $plugin_prefix::              String which is prepended to the plugin package names
#                               type:String
#
# $use_vhost::                  Enclose apache configuration in VirtualHost tags
#                               type:Boolean
#
# $servername::                 Server name of the VirtualHost in the webserver
#                               type:String
#
# $serveraliases::              Server aliases of the VirtualHost in the webserver
#                               type:Array[String]
#
# $ssl::                        Enable and set require_ssl in Foreman settings (note: requires passenger, SSL does not apply to kickstarts)
#                               type:Boolean
#
# $custom_repo::                No need to change anything here by default
#                               if set to true, no repo will be added by this module, letting you to
#                               set it to some custom location.
#                               type:Boolean
#
# $repo::                       This can be stable, nightly or a specific version i.e. 1.7
#                               type:String
#
# $configure_epel_repo::        If disabled the EPEL repo will not be configured on Red Hat family systems.
#                               type:Boolean
#
# $configure_scl_repo::         If disabled the SCL repo will not be configured on Red Hat clone systems.
#                               (Currently only installs repos for CentOS and Scientific)
#                               type:Boolean
#
# $selinux::                    When undef, foreman-selinux will be installed if SELinux is enabled
#                               setting to false/true will override this check (e.g. set to false on 1.1)
#                               type:Optional[Boolean]
#
# $gpgcheck::                   Turn on/off gpg check in repo files (effective only on RedHat family systems)
#                               type:Boolean
#
# $version::                    Foreman package version, it's passed to ensure parameter of package resource
#                               can be set to specific version number, 'latest', 'present' etc.
#                               type:String
#
# $plugin_version::             Foreman plugins package version, it's passed to ensure parameter of package resource
#                               can be set to 'installed', 'latest', 'present' only
#                               type:String
#
# $db_adapter::                 Database 'production' adapter
#                               type:Optional[Enum['mysql2', 'postgresql', 'sqlite3']]
#
# $db_host::                    Database 'production' host
#                               type:Optional[String]
#
# $db_port::                    Database 'production' port
#                               type:Optional[Integer[0, 65535]]
#
# $db_database::                Database 'production' database (e.g. foreman)
#                               type:Optional[String]
#
# $db_username::                Database 'production' user (e.g. foreman)
#                               type:Optional[String]
#
# $db_password::                Database 'production' password, default is randomly generated
#                               type:Optional[String]
#
# $db_sslmode::                 Database 'production' ssl mode
#                               type:Optional[String]
#
# $db_pool::                    Database 'production' size of connection pool
#                               type:Integer[0]
#
# $db_manage_rake::             if enabled, will run rake jobs, which depend on the database
#                               type:Boolean
#
# $app_root::                   Name of foreman root directory
#                               type:Stdlib::Absolutepath
#
# $manage_user::                Controls whether foreman module will manage the user on the system.
#                               type:Boolean
#
# $user::                       User under which foreman will run
#                               type:String
#
# $group::                      Primary group for the Foreman user
#                               type:String
#
# $rails_env::                  Rails environment of foreman
#                               type:String
#
# $user_groups::                Additional groups for the Foreman user
#                               type:Array[String]
#
# $puppet_home::                Puppet home directory
#                               type:Stdlib::Absolutepath
#
# $puppet_ssldir::              Puppet SSL directory
#                               type:Stdlib::Absolutepath
#
# $passenger_interface::        Defines which network interface passenger should listen on, undef means all interfaces
#                               type:Optional[String]
#
# $passenger_prestart::         Pre-start the first passenger worker instance process during httpd start.
#                               type:Boolean
#
# $passenger_min_instances::    Minimum passenger worker instances to keep when application is idle.
#                               type:Integer[0]
#
# $passenger_start_timeout::    Amount of seconds to wait for Ruby application boot.
#                               type:Integer[0]
#
# $vhost_priority::             Defines Apache vhost priority for the Foreman vhost conf file.
#                               type:String
#
# $server_port::                Defines Apache port for HTTP requests
#                               type:Integer[0, 65535]
#
# $server_ssl_port::            Defines Apache port for HTTPS reqquests
#                               type:Integer[0, 65535]
#
# $server_ssl_ca::              Defines Apache mod_ssl SSLCACertificateFile setting in Foreman vhost conf file.
#                               type:Stdlib::Absolutepath
#
# $server_ssl_chain::           Defines Apache mod_ssl SSLCertificateChainFile setting in Foreman vhost conf file.
#                               type:Stdlib::Absolutepath
#
# $server_ssl_cert::            Defines Apache mod_ssl SSLCertificateFile setting in Foreman vhost conf file.
#                               type:Stdlib::Absolutepath
#
# $server_ssl_certs_dir::       Defines Apache mod_ssl SSLCACertificatePath setting in Foreman vhost conf file.
#                               type:Variant[String[0], Stdlib::Absolutepath]
#
# $server_ssl_key::             Defines Apache mod_ssl SSLCertificateKeyFile setting in Foreman vhost conf file.
#                               type:Stdlib::Absolutepath
#
# $server_ssl_crl::             Defines the Apache mod_ssl SSLCARevocationFile setting in Foreman vhost conf file.
#                               type:Optional[Variant[String[0], Stdlib::Absolutepath]]
#
# $client_ssl_ca::              Defines the SSL CA used to communicate with Foreman Proxies
#                               type:Stdlib::Absolutepath
#
# $client_ssl_cert::            Defines the SSL certificate used to communicate with Foreman Proxies
#                               type:Stdlib::Absolutepath
#
# $client_ssl_key::             Defines the SSL private key used to communicate with Foreman Proxies
#                               type:Stdlib::Absolutepath
#
# $keepalive::                  Enable KeepAlive setting of Apache?
#                               type:Boolean
#
# $max_keepalive_requests::     MaxKeepAliveRequests setting of Apache
#                               (Number of requests allowed on a persistent connection)
#                               type:Integer[0]
#
# $keepalive_timeout::          KeepAliveTimeout setting of Apache
#                               (Seconds the server will wait for subsequent requests on a persistent connection)
#                               type:Integer[0]
#
# $oauth_active::               Enable OAuth authentication for REST API
#                               type:Boolean
#
# $oauth_map_users::            Should Foreman use the foreman_user header to identify API user?
#                               type:Boolean
#
# $oauth_consumer_key::         OAuth consumer key
#                               type:String
#
# $oauth_consumer_secret::      OAuth consumer secret
#                               type:String
#
# $http_keytab::                Path to keytab to be used for Kerberos authentication on the WebUI
#                               type:Stdlib::Absolutepath
#
# $pam_service::                PAM service used for host-based access control in IPA
#                               type:String
#
# $ipa_manage_sssd::            If ipa_authentication is true, should the installer manage SSSD? You can disable it
#                               if you use another module for SSSD configuration
#                               type:Boolean
#
# $websockets_encrypt::         Whether to encrypt websocket connections
#                               type:Boolean
#
# $websockets_ssl_key::         SSL key file to use when encrypting websocket connections
#                               type:Stdlib::Absolutepath
#
# $websockets_ssl_cert::        SSL certificate file to use when encrypting websocket connections
#                               type:Stdlib::Absolutepath
#
# $logging_level::              Logging level of the Foreman application
#                               type:Enum['debug', 'info', 'warn', 'error', 'fatal']
#
# $loggers::                    Enable or disable specific loggers, e.g. {"sql" => true}
#                               type:Hash[String, Boolean]
#
# $email_config_method::        Configure email settings in database (1.14+) or configuration file (deprecated)
#                               type:Enum['database', 'file']
#
# $email_conf::                 Email configuration file under /etc/foreman
#                               type:String
#
class foreman (
  $foreman_url               = $::foreman::params::foreman_url,
  $puppetrun                 = $::foreman::params::puppetrun,
  $unattended                = $::foreman::params::unattended,
  $authentication            = $::foreman::params::authentication,
  $passenger                 = $::foreman::params::passenger,
  $passenger_ruby            = $::foreman::params::passenger_ruby,
  $passenger_ruby_package    = $::foreman::params::passenger_ruby_package,
  $plugin_prefix             = $::foreman::params::plugin_prefix,
  $use_vhost                 = $::foreman::params::use_vhost,
  $servername                = $::foreman::params::servername,
  $serveraliases             = $::foreman::params::serveraliases,
  $ssl                       = $::foreman::params::ssl,
  $custom_repo               = $::foreman::params::custom_repo,
  $repo                      = $::foreman::params::repo,
  $configure_epel_repo       = $::foreman::params::configure_epel_repo,
  $configure_scl_repo        = $::foreman::params::configure_scl_repo,
  $selinux                   = $::foreman::params::selinux,
  $gpgcheck                  = $::foreman::params::gpgcheck,
  $version                   = $::foreman::params::version,
  $plugin_version            = $::foreman::params::plugin_version,
  $db_manage                 = $::foreman::params::db_manage,
  $db_type                   = $::foreman::params::db_type,
  $db_adapter                = 'UNSET',
  $db_host                   = 'UNSET',
  $db_port                   = 'UNSET',
  $db_database               = 'UNSET',
  $db_username               = $::foreman::params::db_username,
  $db_password               = $::foreman::params::db_password,
  $db_sslmode                = 'UNSET',
  $db_pool                   = $::foreman::params::db_pool,
  $db_manage_rake            = $::foreman::params::db_manage_rake,
  $app_root                  = $::foreman::params::app_root,
  $manage_user               = $::foreman::params::manage_user,
  $user                      = $::foreman::params::user,
  $group                     = $::foreman::params::group,
  $user_groups               = $::foreman::params::user_groups,
  $rails_env                 = $::foreman::params::rails_env,
  $puppet_home               = $::foreman::params::puppet_home,
  $puppet_ssldir             = $::foreman::params::puppet_ssldir,
  $locations_enabled         = $::foreman::params::locations_enabled,
  $organizations_enabled     = $::foreman::params::organizations_enabled,
  $passenger_interface       = $::foreman::params::passenger_interface,
  $vhost_priority            = $::foreman::params::vhost_priority,
  $server_port               = $::foreman::params::server_port,
  $server_ssl_port           = $::foreman::params::server_ssl_port,
  $server_ssl_ca             = $::foreman::params::server_ssl_ca,
  $server_ssl_chain          = $::foreman::params::server_ssl_chain,
  $server_ssl_cert           = $::foreman::params::server_ssl_cert,
  $server_ssl_certs_dir      = $::foreman::params::server_ssl_certs_dir,
  $server_ssl_key            = $::foreman::params::server_ssl_key,
  $server_ssl_crl            = $::foreman::params::server_ssl_crl,
  $client_ssl_ca             = $::foreman::params::server_ssl_ca,
  $client_ssl_cert           = $::foreman::params::server_ssl_cert,
  $client_ssl_key            = $::foreman::params::server_ssl_key,
  $keepalive                 = $::foreman::params::keepalive,
  $max_keepalive_requests    = $::foreman::params::max_keepalive_requests,
  $keepalive_timeout         = $::foreman::params::keepalive_timeout,
  $oauth_active              = $::foreman::params::oauth_active,
  $oauth_map_users           = $::foreman::params::oauth_map_users,
  $oauth_consumer_key        = $::foreman::params::oauth_consumer_key,
  $oauth_consumer_secret     = $::foreman::params::oauth_consumer_secret,
  $passenger_prestart        = $::foreman::params::passenger_prestart,
  $passenger_min_instances   = $::foreman::params::passenger_min_instances,
  $passenger_start_timeout   = $::foreman::params::passenger_start_timeout,
  $admin_username            = $::foreman::params::admin_username,
  $admin_password            = $::foreman::params::admin_password,
  $admin_first_name          = $::foreman::params::admin_first_name,
  $admin_last_name           = $::foreman::params::admin_last_name,
  $admin_email               = $::foreman::params::admin_email,
  $initial_organization      = $::foreman::params::initial_organization,
  $initial_location          = $::foreman::params::initial_location,
  $ipa_authentication        = $::foreman::params::ipa_authentication,
  $http_keytab               = $::foreman::params::http_keytab,
  $pam_service               = $::foreman::params::pam_service,
  $ipa_manage_sssd           = $::foreman::params::ipa_manage_sssd,
  $websockets_encrypt        = $::foreman::params::websockets_encrypt,
  $websockets_ssl_key        = $::foreman::params::websockets_ssl_key,
  $websockets_ssl_cert       = $::foreman::params::websockets_ssl_cert,
  $logging_level             = $::foreman::params::logging_level,
  $loggers                   = $::foreman::params::loggers,
  $email_config_method       = $::foreman::params::email_config_method,
  $email_conf                = $::foreman::params::email_conf,
  $email_source              = $::foreman::params::email_source,
  $email_delivery_method     = $::foreman::params::email_delivery_method,
  $email_smtp_address        = $::foreman::params::email_smtp_address,
  $email_smtp_port           = $::foreman::params::email_smtp_port,
  $email_smtp_domain         = $::foreman::params::email_smtp_domain,
  $email_smtp_authentication = $::foreman::params::email_smtp_authentication,
  $email_smtp_user_name      = $::foreman::params::email_smtp_user_name,
  $email_smtp_password       = $::foreman::params::email_smtp_password,
) inherits foreman::params {
  if $db_adapter == 'UNSET' {
    $db_adapter_real = $::foreman::db_type ? {
      'sqlite' => 'sqlite3',
      'mysql'  => 'mysql2',
      default  => $::foreman::db_type,
    }
  } else {
    $db_adapter_real = $db_adapter
  }
  validate_bool($passenger)
  if $passenger == false and $ipa_authentication {
    fail("${::hostname}: External authentication via IPA can only be enabled when passenger is used.")
  }
  validate_bool($websockets_encrypt)
  validate_re($logging_level, '^(debug|info|warn|error|fatal)$')
  validate_re($plugin_version, '^(installed|present|latest)$')
  validate_hash($loggers)
  validate_array($serveraliases)
  validate_re($email_config_method, '^(database|file)$')
  if $email_delivery_method {
    validate_re($email_delivery_method, ['^sendmail$', '^smtp$'], "email_delivery_method can be either sendmail or smtp, not ${email_delivery_method}")
  }
  validate_bool($puppetrun)

  include ::foreman::repo

  Class['foreman::repo']
  ~> class { '::foreman::install': }
  ~> class { '::foreman::config': }
  ~> class { '::foreman::database': }
  ~> class { '::foreman::service': }
  -> Class['foreman']
  -> Foreman_smartproxy <| base_url == $foreman_url |>

  # When db_manage and db_manage_rake are false, this extra relationship is required.
  Class['foreman::config'] ~> Class['foreman::service']

  # Anchor these separately so as not to break
  # the notify between main classes
  Class['foreman::install']
  ~> Package <| tag == 'foreman-compute' |>
  ~> Class['foreman::service']

  Class['foreman::repo']
  ~> Package <| tag == 'foreman::cli' |>
  ~> Class['foreman']

  Class['foreman::repo']
  ~> Package <| tag == 'foreman::providers' |>
  -> Class['foreman']

  # lint:ignore:spaceship_operator_without_tag
  Class['foreman::database']
  ~> Foreman::Plugin <| |>
  ~> Class['foreman::service']
  # lint:endignore

  contain 'foreman::settings' # lint:ignore:relative_classname_inclusion (PUP-1597)
  Class['foreman::database'] -> Class['foreman::settings']
}
