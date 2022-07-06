# == Class: rsyslog
#
# Full description of class rsyslog here.
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
#  class { 'rsyslog':
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
class rsyslog (
  $purge_excludes  = $rsyslog::params::purge_excludes,
  $confd_dir       = $rsyslog::params::confd_dir,
  $conf_file       = $rsyslog::params::conf_file,
  $conf_directives = {},
  $rm_directives   = {},
  $conf_file_mode  = $rsyslog::params::conf_file_mode,
  $svc_name        = $rsyslog::params::svc_name,
  $pkg_name        = $rsyslog::params::pkg_name,
  $set_comments    = true,
  $purge_confd     = true,
  $multi_value_list= $rsyslog::params::multi_value_list,
) inherits rsyslog::params {
  validate_array($purge_excludes)
  validate_array($multi_value_list)
  validate_hash($conf_directives)
  validate_hash($rm_directives)

  contain rsyslog::install
  contain rsyslog::config
  contain rsyslog::service
}
