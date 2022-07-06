class ssh_client::install {
  package { "$ssh_client::ssh_pkg_name":
    ensure  =>  installed,
  }
}
