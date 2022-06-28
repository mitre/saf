class nfs_client::service (
) inherits nfs_client {
  service { "$gssproxy_svc":
    ensure    =>  running,
    enable    =>  true,
  }

  service { "$rpcgssd_svc":
    ensure    =>  running,
    enable    =>  true,
  }


  service { "$idmapd_svc":
    ensure    => running,
    enable    => true,
    subscribe => File["$idmapd_file"],
  }
}
