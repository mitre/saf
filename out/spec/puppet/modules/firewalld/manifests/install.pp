class firewalld::install {
  package { "$firewalld::pkg_name":
    ensure  =>  installed,
  }
}
