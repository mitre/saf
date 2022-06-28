# == Class: profiles::rhel7::nfs_client
#
# This is a site-specific module used to orchestrate the other pieces required
# for a RHEL6/7 system use use NFSv4 with Kerberos security
#
# === Parameters
#
# ["nfs_domain"]
#   Required parameter configures the NFSv4 domain name
#
# ["krb_nfs_spn"]
#   Parameter configures the Kerberos SPN used by the NFS service
#
# === Variables
#
# None
#
# === Examples
#
#  class { 'profiles::rhel7::nfs_client':
#    nfs_domain => 'example.com',
#  }
#
# === Authors
#
# Author Chris Southall <southalc@saic.com>
#
# === Copyright
#
# Copyright 2018 SIAC, unless otherwise noted.
#
class profiles::rhel7::nfs_client (
  $nfs_domain,
  $nfs_krb5_spn   = 'nfs',
  $autofs_mounts  = {},
) inherits profiles {
  include profiles::rhel7::ad_client

  validate_string($nfs_domain)
  validate_string($nfs_krb5_spn)
  validate_hash($autofs_mounts)

  class { '::nfs_client':
    nfs_domain  => $nfs_domain,
  }

  krb5_client::spn { "$nfs_krb5_spn":
    notify_svc  => ["$::nfs_client::service::gssproxy_svc","$::nfs_client::service::rpcgssd_svc"],
  }


  class { 'autofs':
    mounts => $autofs_mounts,
  }

  Krb5_client::Spn["$nfs_krb5_spn"] -> Class['::nfs_client'] -> Class['autofs']
}

