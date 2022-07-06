# == Class: add_ipv6
#
# Full description of class add_ipv6 here.
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
#  class { 'add_ipv6':
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
class add_ipv6 (
  $default_gateway     = undef,
  $ipv6_settings       = {},
  $automatic           = true,
  $set_comments        = true,
  $restart_if          = false,
) inherits add_ipv6::params {
  validate_string($default_gateway)
  validate_bool($automatic)
  validate_bool($set_comments)
  validate_hash($ipv6_settings)

  if $automatic and $::primary_interface != 'none' and $::ipv6_addrs != 'none' {
    if $default_gateway == undef {
      notify { 'No default IPv6 gateway provided. A gateway is required to configure IPv6.': }
    } else {
      contain add_ipv6::config
    }
  } else {
    notify { 'No IPv6 addresses found. Not configuring IPv6.': }
  }
}
