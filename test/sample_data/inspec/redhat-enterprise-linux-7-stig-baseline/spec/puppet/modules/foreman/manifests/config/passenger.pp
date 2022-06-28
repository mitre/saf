# Configure the foreman service using passenger
#
# === Parameters:
#
# $app_root::                 Root of the application.
#
# $listen_on_interface::      Specify which interface to bind passenger to.
#                             Defaults to all interfaces.
#
# $ruby::                     Path to Ruby interpreter
#
# $priority::                 Apache vhost priority
#
# $servername::               Servername for the vhost.
#
# $serveraliases::            Serveraliases for the vhost.
#                             type:array
#
# $server_port::              Port for Apache to listen on HTTP requests
#                             type:integer
#
# $server_ssl_port::          Port for Apache to listen on HTTPS requests
#                             type:integer
#
# $ssl::                      Whether to enable SSL.
#
# $ssl_cert::                 Location of the SSL certificate file.
#
# $ssl_certs_dir::            Location of additional certificates for SSL client authentication.
#
# $ssl_key::                  Location of the SSL key file.
#
# $ssl_ca::                   Location of the SSL CA file
#
# $ssl_chain::                Location of the SSL chain file
#
# $ssl_crl::                  Location of the SSL certificate revocation list file
#
# $use_vhost::                Whether to install a vhost. Note that using ssl and
#                             no vhost is unsupported.
#
# $user::                     The user under which the application runs.
#
# $prestart::                 Pre-start the first passenger worker instance process during httpd start.
#                             type:boolean
#
# $min_instances::            Minimum passenger worker instances to keep when application is idle.
#
# $start_timeout::            Amount of seconds to wait for Ruby application boot.
#
# $keepalive::                Enable KeepAlive setting of Apache?
#                             type:boolean
#
# $max_keepalive_requests::   MaxKeepAliveRequests setting of Apache
#                             (Number of requests allowed on a persistent connection)
#                             type:integer
#
# $keepalive_timeout::        KeepAliveTimeout setting of Apache
#                             (Seconds the server will wait for subsequent requests on a persistent connection)
#                             type:integer
#
# $access_log_format::        Apache log format to use
#                             type:string
#
class foreman::config::passenger(
  $app_root               = $::foreman::app_root,
  $listen_on_interface    = $::foreman::passenger_interface,
  $ruby                   = $::foreman::passenger_ruby,
  $priority               = $::foreman::vhost_priority,
  $servername             = $::foreman::servername,
  $serveraliases          = $::foreman::serveraliases,
  $server_port            = $::foreman::server_port,
  $server_ssl_port        = $::foreman::server_ssl_port,
  $ssl                    = $::foreman::ssl,
  $ssl_ca                 = $::foreman::server_ssl_ca,
  $ssl_chain              = $::foreman::server_ssl_chain,
  $ssl_cert               = $::foreman::server_ssl_cert,
  $ssl_certs_dir          = $::foreman::server_ssl_certs_dir,
  $ssl_key                = $::foreman::server_ssl_key,
  $ssl_crl                = $::foreman::server_ssl_crl,
  $use_vhost              = $::foreman::use_vhost,
  $user                   = $::foreman::user,
  $prestart               = $::foreman::passenger_prestart,
  $min_instances          = $::foreman::passenger_min_instances,
  $start_timeout          = $::foreman::passenger_start_timeout,
  $foreman_url            = $::foreman::foreman_url,
  $keepalive              = $::foreman::keepalive,
  $max_keepalive_requests = $::foreman::max_keepalive_requests,
  $keepalive_timeout      = $::foreman::keepalive_timeout,
  $access_log_format      = undef,
) {
  # validate parameter values
  if $listen_on_interface {
    validate_string($listen_on_interface)
  }
  validate_string($servername)
  validate_bool($ssl)
  validate_bool($prestart)
  validate_bool($keepalive)
  validate_integer($max_keepalive_requests)
  validate_integer($keepalive_timeout)
  validate_string($priority)
  validate_integer($server_port)
  validate_integer($server_ssl_port)

  $docroot = "${app_root}/public"
  $suburi_parts = split($foreman_url, '/')
  $suburi_parts_count = size($suburi_parts) - 1
  if $suburi_parts_count >= 3 {
    $suburi_without_slash = join(values_at($suburi_parts, ["3-${suburi_parts_count}"]), '/')
    if $suburi_without_slash {
      $suburi = "/${suburi_without_slash}"
    }
  }

  include ::apache
  include ::apache::mod::headers
  include ::apache::mod::passenger

  if $use_vhost {
    # Check the value in case the interface doesn't exist, otherwise listen on all interfaces
    if $listen_on_interface and $listen_on_interface in split($::interfaces, ',') {
      $listen_interface = inline_template("<%= @ipaddress_${listen_on_interface} %>")
    } else {
      $listen_interface = undef
    }

    $http_prestart = $prestart ? {
      true  => "http://${servername}:${server_port}",
      false => undef,
    }

    file { "${apache::confd_dir}/${priority}-foreman.d":
      ensure  => 'directory',
      owner   => 'root',
      group   => 'root',
      mode    => '0644',
      purge   => true,
      recurse => true,
    }

    $keepalive_onoff = $keepalive ? {
      true    => 'on',
      default => 'off',
    }

    apache::vhost { 'foreman':
      add_default_charset     => 'UTF-8',
      docroot                 => $docroot,
      manage_docroot          => false,
      ip                      => $listen_interface,
      options                 => ['SymLinksIfOwnerMatch'],
      passenger_app_root      => $app_root,
      passenger_min_instances => $min_instances,
      passenger_pre_start     => $http_prestart,
      passenger_start_timeout => $start_timeout,
      passenger_ruby          => $ruby,
      port                    => $server_port,
      priority                => $priority,
      servername              => $servername,
      serveraliases           => $serveraliases,
      keepalive               => $keepalive_onoff,
      max_keepalive_requests  => $max_keepalive_requests,
      keepalive_timeout       => $keepalive_timeout,
      access_log_format       => $access_log_format,
      custom_fragment         => template('foreman/_assets.conf.erb', 'foreman/_virt_host_include.erb',
                                          'foreman/_suburi.conf.erb'),
    }

    if $ssl {
      $https_prestart = $prestart ? {
        true  => "https://${servername}:${server_ssl_port}",
        false => undef,
      }
      if $ssl_crl and $ssl_crl != '' {
        $ssl_crl_real = $ssl_crl
        $ssl_crl_check = 'chain'
      } else {
        $ssl_crl_real = undef
        $ssl_crl_check = undef
      }

      file { "${apache::confd_dir}/${priority}-foreman-ssl.d":
        ensure  => 'directory',
        owner   => 'root',
        group   => 'root',
        mode    => '0644',
        purge   => true,
        recurse => true,
      }

      apache::vhost { 'foreman-ssl':
        add_default_charset     => 'UTF-8',
        docroot                 => $docroot,
        manage_docroot          => false,
        ip                      => $listen_interface,
        options                 => ['SymLinksIfOwnerMatch'],
        passenger_app_root      => $app_root,
        passenger_min_instances => $min_instances,
        passenger_pre_start     => $https_prestart,
        passenger_start_timeout => $start_timeout,
        passenger_ruby          => $ruby,
        port                    => $server_ssl_port,
        priority                => $priority,
        servername              => $servername,
        serveraliases           => $serveraliases,
        ssl                     => true,
        ssl_cert                => $ssl_cert,
        ssl_certs_dir           => $ssl_certs_dir,
        ssl_key                 => $ssl_key,
        ssl_chain               => $ssl_chain,
        ssl_ca                  => $ssl_ca,
        ssl_crl                 => $ssl_crl_real,
        ssl_crl_check           => $ssl_crl_check,
        ssl_verify_client       => 'optional',
        ssl_options             => '+StdEnvVars +ExportCertData',
        ssl_verify_depth        => '3',
        keepalive               => $keepalive_onoff,
        max_keepalive_requests  => $max_keepalive_requests,
        keepalive_timeout       => $keepalive_timeout,
        access_log_format       => $access_log_format,
        custom_fragment         => template('foreman/_assets.conf.erb', 'foreman/_ssl_virt_host_include.erb',
                                            'foreman/_suburi.conf.erb'),
      }
    }
  } else {
    file { 'foreman_vhost':
      path    => "${apache::params::conf_dir}/foreman.conf",
      content => template('foreman/foreman-apache.conf.erb'),
      mode    => '0644',
    }

    if $ssl {
      fail('Use of ssl = true and use_vhost = false is unsupported')
    }
  }

  file { ["${app_root}/config.ru", "${app_root}/config/environment.rb"]:
    owner => $user,
  }
}
