class rsyslog::install {
  package { $rsyslog::pkg_name:
    ensure  =>  installed,
  }
}
