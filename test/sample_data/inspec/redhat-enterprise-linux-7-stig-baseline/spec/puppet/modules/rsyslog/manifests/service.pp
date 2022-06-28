class rsyslog::service {
  service { $rsyslog::svc_name:
    enable  =>  true,
    ensure  =>  running,
    require =>  Package["${rsyslog::pkg_name}"],
  }
}
