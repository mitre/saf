class nfs_client::install (
) inherits nfs_client {
  package { [$nfs_client_pkgs]:
    ensure  =>  installed,
  }
}
