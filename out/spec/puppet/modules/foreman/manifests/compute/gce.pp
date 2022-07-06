# = Foreman Google Compute Engine compute resource support
#
# Provides support for Google Compute Engine compute resources
#
# === Parameters:
#
# $version::  Package version to install, defaults to installed
#             type:Optional[String]
#
class foreman::compute::gce ( $version = 'installed' ) {
  package { 'foreman-gce':
    ensure => $version,
    tag    => [ 'foreman-compute', ],
  }
}
