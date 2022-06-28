# == Class: vmware_gugent
#
# Full description of class vmware_gugent here.
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
#  class { 'vmware_gugent':
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
class vmware_gugent (
  $pkg_name             = $vmware_gugent::params::pkg_name,
  $trust_cert           = $vmware_gugent::params::trust_cert,
  $vra_server           = undef,
  $install_type         = 'vsphere',
  $ssl_setting          = 'ssl',
  $umask                = undef,
) inherits vmware_gugent::params {

  if defined('$::vra_provisioned') and $::vra_provisioned and $::gugent_successful == 'false' {
    if $::gugent_running == 'true' { 
      notify { "The gugent agent appears to already be running. Skipping.": }
    } elsif $vra_server {
      validate_re($vra_server, ".*:[0-9]*")
      validate_re($ssl_setting, ['^ssl$','^nossl$'])
      validate_re($install_type, ['^ec2$','^vcd$','^vca$','^vsphere$'])

      $ensure = 'installed'

      contain vmware_gugent::install 
      contain vmware_gugent::config 
      contain vmware_gugent::execute

      Class['vmware_gugent::install']->Class['vmware_gugent::config']->Class['vmware_gugent::execute']
    }
  } elsif !defined('$::vra_provisioned') or !$::vra_provisioned {
    $ensure = 'absent'

    contain vmware_gugent::install 
  }
}
