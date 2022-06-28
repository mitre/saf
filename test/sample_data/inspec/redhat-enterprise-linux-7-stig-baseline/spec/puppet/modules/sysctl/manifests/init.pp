# == Class: sysctl
#
# Full description of class sysctl here.
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
#  class { 'sysctl':
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
class sysctl (
  $custom_settings  = {},
  $sysctl_config    = $sysctl::params::sysctl_config,
  $sysctl_pkg_name  = $sysctl::params::sysctl_pkg_name,
  $sysctl_d_dir     = $sysctl::params::sysctl_d_dir,
  $sysctl_suffix    = $sysctl::params::sysctl_suffix,
  $set_comments	    = true,
) inherits sysctl::params {

  validate_hash($custom_settings)

  contain sysctl::install
  contain sysctl::config
}
