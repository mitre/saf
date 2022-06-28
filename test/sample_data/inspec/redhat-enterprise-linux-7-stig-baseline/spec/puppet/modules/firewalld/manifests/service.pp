class firewalld::service {
  service { "$firewalld::svc_name":
    ensure  =>  running,
    enable  =>  true,
    require =>  Package["$firewalld::pkg_name"],
  }
}
