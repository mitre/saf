class sssd::install {
  package { "$sssd::sssd_pkg":
    ensure  =>  installed,
  }
}
