class sssd::service {
  service { "$sssd::sssd_svc":
    enable  =>  true,
    ensure  =>  running,
    require =>  File["$sssd::sssd_conf"],
  }
}
