# == Class: nfs_client
#
# Manage nfs_client configuration and services
#
# === Parameters
#
# Document parameters here.
#
# ['nfs_domain']
# The NFSv4 domain to be used with idmapd
#
# ['sysconfig_nfs']
# The OS specific NFS configuration file
#
# ['nfs_svcopts']
# Hash of configuration options for the $sysconfig_nfs file
#
# ['idmapd_file']
# The OS specific idmapd configuration file
#
# ['idmap_general']
# Optional hash of general options for the $idmap_general file
#
# ['idmap_mapping']
# Optional hash of mapping options for the $idmap_general file
#
# ['idmap_translation']
# Optional hash of translation options for the $idmap_general file
#
# ['idmap_static']
# Optional hash of static options for the $idmap_general file
#
# === Variables
#
# N/a
#
# === Examples
#
#  class { 'nfs_client':
#    nfs_domain => 'example.com',
#  }
#
#
class nfs_client (
  $nfs_domain,
  $sysconfig_nfs      = $nfs_client::params::sysconfig_nfs,
  $nfs_svcopts        = $nfs_client::params::nfs_svcopts,
  $idmapd_file        = $nfs_client::params::idmapd_file,
  $idmap_general      = {},
  $idmap_mapping      = {},
  $idmap_translation  = {},
  $idmap_static       = {},
) inherits nfs_client::params {

  validate_string($nfs_domain)
  validate_hash($nfs_svcopts)
  validate_string($idmapd_file)
  validate_hash($idmap_general)
  validate_hash($idmap_mapping)
  validate_hash($idmap_translation)
  validate_hash($idmap_static)

  contain nfs_client::install
  contain nfs_client::config
  contain nfs_client::service
}
