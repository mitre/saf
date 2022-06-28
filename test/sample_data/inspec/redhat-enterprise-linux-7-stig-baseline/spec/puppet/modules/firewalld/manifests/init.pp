# == Class: firewalld
#
# Full description of class firewalld here.
#
# === Parameters
#
# Document parameters here.
#
# [*sample_parameter*]
#   Explanation of what this parameter affects and what it defaults to.
#   e.g. "Specify one or more upstream ntp servers as an array."
#
# === Variables
#
# Here you should define a list of variables that this module would require.
#
# [*sample_variable*]
#   Explanation of how this variable affects the funtion of this class and if
#   it has a default. e.g. "The parameter enc_ntp_servers must be set by the
#   External Node Classifier as a comma separated list of hostnames." (Note,
#   global variables should be avoided in favor of class parameters as
#   of Puppet 2.6.)
#
# === Examples
#
#  class { 'firewalld':
#    servers => [ 'pool.ntp.org', 'ntp.local.company.com' ],
#  }
#
# === Authors
#
# Author Name <author@domain.com>
#
# === Copyright
#
# Copyright 2017 Your name here, unless otherwise noted.
#
class firewalld (
  $pkg_name             = $firewalld::params::pkg_name,
  $svc_name             = $firewalld::params::svc_name,
  $service_dir          = $firewalld::params::service_dir,
  $reload_cmd           = $firewalld::params::reload_cmd,
  $direct_rules         = {},
  $zones                = {},
  $ports                = {},
  $services             = {},
  $rich_rules           = {},
  $ipsets               = {},
  $direct_chains        = {},
  $direct_passthroughs  = {},
) inherits firewalld::params {
  contain firewalld::install
  contain firewalld::service

  validate_hash($direct_rules)
  validate_hash($zones)
  validate_hash($ports)
  validate_hash($services)
  validate_hash($rich_rules)
  validate_hash($ipsets)
  validate_hash($direct_chains)
  validate_hash($direct_passthroughs)

  exec { 'firewalld::reload':
    command     => "${reload_cmd}",
    refreshonly => true,
  }

  create_resources('firewalld_direct_rule',$direct_rules)
  create_resources('firewalld_zone',$zones)
  create_resources('firewalld_port',$ports)
  create_resources('firewalld_service',$services)
  create_resources('firewalld_rich_rule',$rich_rules)
  create_resources('firewalld_ipset',$ipsets)
  create_resources('firewalld_direct_chain',$direct_chains)
  create_resources('firewalld_direct_passthrough',$direct_passthroughs)

  # Set dependencies using resource chaining so that resource declarations made
  # outside of this class (eg: from the profile) also get their dependencies set
  # automatically, this addresses various issues found in
  # https://github.com/crayfishx/puppet-firewalld/issues/38
  #
  Service['firewalld'] -> Firewalld_zone <||> ~> Exec['firewalld::reload']
  Service['firewalld'] -> Firewalld_rich_rule <||> ~> Exec['firewalld::reload']
  Service['firewalld'] -> Firewalld_service <||> ~> Exec['firewalld::reload']
  Service['firewalld'] -> Firewalld_port <||> ~> Exec['firewalld::reload']
  Service['firewalld'] -> Firewalld_ipset <||> ~> Exec['firewalld::reload']
  Service['firewalld'] -> Firewalld_direct_chain <||> ~> Exec['firewalld::reload']
  Service['firewalld'] -> Firewalld_direct_rule <||> ~> Exec['firewalld::reload']
  Service['firewalld'] -> Firewalld_direct_passthrough <||> ~> Exec['firewalld::reload']
}
