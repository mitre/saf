# == Class: sssd
#
# This module manages the core installation and configuraiton of sssd.
# It handles installing the package, enabling/starting the service
# and creating a basic, barebones configuration. DISA STIG configurations
# are also included.
#
# This module depends upon the system using a version of sssd that supports
# the conf.d paradigm.
#
# === Parameters
#
# [*confd_dir*]
#   This is the OS-specific location of the sssd conf.d directory. All
#   configurations, other than the core sssd.conf, should be placed here.
#
# [*config_nsswitch*]
#   This boolean controls whether or not to configure the nsswitch file
#   to utilize sssd as a datasource. Default: true
#
# [*exclude_list*]
#   The function of this module depends on the conf.d configuration paradigm.
#   For predictable configuration we also manage (purge) the conf.d directory.
#   This prevents random admins from deploying custom configuration outside
#   of Puppet. However, there may be circumstances where known configuration
#   files need to be deployed manually. This parameter allows for a list of
#   globs to be ignored when purging the conf.d directory.
#
# [*nsswitch_file*]
#   This is the OS-specific location of the nsswitch configuration file.
#
# [*purge_confd*]
#   Boolean specifying whether or not to purge the conf.d directory when 
#   deploying new content. Default: true
#
# [*sssd_conf*]
#   This is the OS-specific location of the primary sssd.conf configuration
#   file.
#
# [*stig_enabled*]
#   Boolean specifying whether or not to include default STIG-mandated
#   configurations. When enabled the file conf.d/${stig_priority}_stig.conf
#   will be deployed.
#
# [*stig_priority*]
#   This string value is used to order the STIG configuration for precedence.
#   By default '01' is used which will lower the priority of STIG settings so
#   that they may be overriden where necessary. Change to a value such as '99'
#   where STIG should not be able to be overridden.
#
# === Variables
#
# None
#
# === Examples
#
#  class { 'sssd':
#    stig_enabled => true,
#    exclude_list => ['*satellite.conf'],
#  }
#
# === Authors
#
# Author Lesley Kimmel <lesley.j.kimmel@gmail.com>
#
# === Copyright
#
# Copyright 2017 Lesley Kimmel, unless otherwise noted.
#
class sssd (
  $config_nsswitch  = true,
  $sssd_conf        = $sssd::params::sssd_conf,
  $nsswitch_file    = $sssd::params::nsswitch_file,
  $confd_dir        = $sssd::params::confd_dir,
  $enable_domains   = ['LOCAL'],
  $enable_services  = ['nss','pam'],
  $config_version   = 2,
  $extra_sssd_opts  = {},
  $service_opts     = {},
  $purge_confd      = true,
  $exclude_list     = [],
) inherits sssd::params {

  $sssd_pkg = $sssd::params::sssd_pkg
  $sssd_svc = $sssd::params::sssd_svc

  validate_bool($config_nsswitch)
  validate_bool($purge_confd)
  validate_array($exclude_list)
  validate_array($enable_domains)
  validate_hash($extra_sssd_opts)
  validate_hash($service_opts)
 
  contain sssd::install
  contain sssd::config
  contain sssd::service
}
