class nfs_client::params {
  case $::osfamily {
    'RedHat': {
      $sysconfig_nfs    = '/etc/sysconfig/nfs'
      $nfs_client_pkgs  = ['nfs-utils','nfs4-acl-tools','rpcbind']
      $idmapd_file      = '/etc/idmapd.conf'
      $custom_idmap     = {}

    case $::osfamily {
      'RedHat': {
        case $::operatingsystemmajrelease {
          '7': {
            $rpcbind_svc                = {'rpcbind.service' => {}}
            $idmapd_svc                 = 'nfs-idmapd.service'
            $gssproxy_svc               = 'gssproxy.service'
            $rpcgssd_svc                = 'rpc-gssd.service'
            $nfs_svcopts                =  {
                            'RPCNFSDARGS'    => '',
                            'RPCMOUNTDOPTS'  => '',
                            'STATDARG'       => '',
                            'SMNOTIFYARGS'   => '',
                            'RPCIDMAPDARGS'  => '',
                            'RPCGSSDARGS'    => '',
                            'GSS_USE_PROXY'  => 'yes',
                            'RPCSVCGSSDARGS' => '',
                            'BLKMAPDARGS'    => '',
                            }
            }
          }
        }
      }
    }
  }
}

