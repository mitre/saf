class nfs_client::config (
) inherits nfs_client {
  file { "$idmapd_file":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "0644",
    content =>  template('nfs_client/idmapd.conf.erb'),
    require =>  Package[$nfs_client_pkgs],
  }
  file { "$sysconfig_nfs":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "0644",
    content =>  template('nfs_client/sysconfig-nfs.erb'),
    require =>  Package[$nfs_client_pkgs],
  }
}
