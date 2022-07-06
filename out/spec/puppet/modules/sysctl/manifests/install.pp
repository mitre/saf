class sysctl::install {
  package { "$sysctl::sysctl_pkg_name":
    ensure  =>  installed,
  }
}
