# = Foreman Rackspace compute resource support
#
# Provides support for Rackspace compute resources
#
# === Parameters:
#
# $version::  Package version to install, defaults to installed
#             type:Optional[String]
#
class foreman::compute::rackspace ( $version = 'installed' ) {
  package { 'foreman-rackspace':
    ensure => $version,
    tag    => [ 'foreman-compute', ],
  }
}
