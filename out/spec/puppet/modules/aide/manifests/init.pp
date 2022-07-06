# == Class: aide
#
# Full description of class aide here.
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
#  class { 'aide':
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
class aide (
  $run_frequency        = "daily",
  $use_defaults         = true,
  $initialize           = true,
  $aide_pkg             = $aide::params::aide_pkg,
  $aide_config          = $aide::params::aide_config,
  $aide_db              = $aide::params::aide_db,
  $aide_db_new          = $aide::params::aide_db_new,
  $aide_init            = $aide::params::aide_init,
  $default_defines      = $aide::params::default_defines,
  $default_config_opts  = $aide::params::default_config_opts,
  $default_aliases      = $aide::params::default_aliases,
  $default_watch_rules  = $aide::params::default_watch_rules,
  $custom_defines       = {},
  $custom_config_opts   = {},
  $custom_aliases       = {},
  $custom_watch_rules   = {},
) inherits aide::params {

  validate_re($run_frequency,['daily','weekly','hourly','monthly'])
  validate_bool($use_defaults)
  validate_bool($initialize)
  validate_hash($custom_defines)
  validate_hash($custom_config_opts)
  validate_hash($custom_aliases)
  validate_hash($custom_watch_rules)

  contain aide::install
  contain aide::config
}
