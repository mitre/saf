# = Foreman VMware compute resource support
#
# Provides support for VMware compute resources
#
# === Parameters:
#
# $version::  Package version to install, defaults to installed
#             type:Optional[String]
#
class foreman::compute::vmware ( $version = 'installed' ) {
  package { 'foreman-vmware':
    ensure => $version,
    tag    => [ 'foreman-compute', ],
  }
}
