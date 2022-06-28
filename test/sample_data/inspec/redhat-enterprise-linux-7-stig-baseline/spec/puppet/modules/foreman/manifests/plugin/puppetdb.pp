# = PuppetDB Foreman plugin
#
# Installs the puppetdb_foreman plugin
#
# === Parameters:
#
# $package::           Package name to install, use ruby193-rubygem-puppetdb_foreman on Foreman 1.8/1.9 on EL
#                      type:String
#
# $address::           Address of puppetdb API.
#                      Defaults to 'https://localhost:8081/pdb/cmd/v1'
#                      type:Stdlib::HTTPUrl
#
# $dashboard_address:: Address of puppetdb dashboard.
#                      Defaults to 'http://localhost:8080/pdb/dashboard'
#                      type:Stdlib::HTTPUrl
#
# $ssl_ca_file::       CA certificate file which will be used to connect to the PuppetDB API.
#                      Defaults to client_ssl_ca
#                      type:String
#
# $ssl_certificate::   Certificate file which will be used to connect to the PuppetDB API.
#                      Defaults to client_ssl_cert
#                      type:String
#
# $ssl_private_key::   Private key file which will be used to connect to the PuppetDB API.
#                      Defaults to client_ssl_key
#                      type:String
class foreman::plugin::puppetdb (
  $package           = $foreman::plugin::puppetdb::params::package,
  $address           = $foreman::plugin::puppetdb::params::address,
  $dashboard_address = $foreman::plugin::puppetdb::params::dashboard_address,
  $ssl_ca_file       = $foreman::plugin::puppetdb::params::ssl_ca_file,
  $ssl_certificate   = $foreman::plugin::puppetdb::params::ssl_certificate,
  $ssl_private_key   = $foreman::plugin::puppetdb::params::ssl_private_key,
) inherits foreman::plugin::puppetdb::params {

  validate_string($package, $address, $dashboard_address)

  foreman::plugin { 'puppetdb':
    package => $package,
  }
  -> foreman_config_entry { 'puppetdb_enabled':
    value => true,
  }
  -> foreman_config_entry { 'puppetdb_address':
    value => $address,
  }
  -> foreman_config_entry { 'puppetdb_dashboard_address':
    value => $dashboard_address,
  }
  -> foreman_config_entry { 'puppetdb_ssl_ca_file':
    value => $ssl_ca_file,
  }
  -> foreman_config_entry { 'puppetdb_ssl_certificate':
    value => $ssl_certificate,
  }
  -> foreman_config_entry { 'puppetdb_ssl_private_key':
    value => $ssl_private_key,
  }
}
