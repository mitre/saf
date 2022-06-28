# = Foreman LibVirt compute resource support
#
# Provides support for Libvirt compute resources
#
# === Parameters:
#
# $version::  Package version to install, defaults to installed
#             type:Optional[String]
#
class foreman::compute::libvirt ( $version = 'installed' ) {
  package { 'foreman-libvirt':
    ensure => $version,
    tag    => [ 'foreman-compute', ],
  }
}
