class sshd::install {
  package { "$sshd::sshd_pkg_name":
    ensure  =>  installed,
  }
}
