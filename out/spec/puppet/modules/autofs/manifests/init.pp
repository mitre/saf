# == Class: autofs
#
# Manage the autofs service and local map files.  The 'mount' class
# that does all the work was taken from PuppetForge
#
# === Parameters
#
# [mounts]
#   Explanation of what this parameter affects and what it defaults to.
#   e.g. "Specify one or more upstream ntp servers as an array."
#
# === Variables
# 
# === Examples
#
#  class { 'autofs':
#    servers => [ 'pool.ntp.org', 'ntp.local.company.com' ],
#  }
#
# === Authors
#
# Author Name <author@domain.com>
#
# === Copyright
#
# Copyright 2018 Your name here, unless otherwise noted.
#
class autofs (
  $mounts         = {},
  $svc_name       = $autofs::params::svc_name,
  $pkg_name       = $autofs::params::pkg_name,
) inherits autofs::params {

  validate_hash($mounts)

  contain '::autofs::install'
  contain '::autofs::service'

  if $mounts {
    $data = hiera_hash('autofs::mounts', $mounts)
    create_resources('autofs::mount', $data)
  }

}
