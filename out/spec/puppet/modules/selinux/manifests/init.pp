# == Class: selinux
#
# Full description of class selinux here.
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
#  class { 'selinux':
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
class selinux (
  $mode           = 'enforcing',
  $type           = 'targeted',
  $selinux_config = '/etc/sysconfig/selinux',
  $set_comments   = true,
  $change_runtime = false,
) {
  validate_re($mode, ['enforcing','permissive','disabled'])
  validate_re($type, ['targeted','minimum','mls'])
  validate_bool($set_comments)
  validate_bool($change_runtime)

  $selinux_configs = ["SELINUX:${mode}", "SELINUXTYPE:${type}"]

  selinux::do_simple_vars { $selinux_configs:
    file        =>  $selinux_config,
    lens        =>  'shellvars.lns',
    set_comment =>  $set_comments,
  }

  if $change_runtime {
    $sel_dict = { 'enforcing'=>1, 'permissive'=>0, 'disabled'=>0 }
    $sel_mode = $sel_dict[$mode]
    exec { 'Change runtime SELinux mode':
      command =>  "/usr/sbin/setenforce $sel_mode",
    }
    Selinux::Do_simple_vars["SELINUX:${mode}"] -> Exec["Change runtime SELinux mode"]
  }
}
