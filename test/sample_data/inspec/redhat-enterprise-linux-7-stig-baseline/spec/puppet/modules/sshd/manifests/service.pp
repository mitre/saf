class sshd::service {

  service { "$sshd::svc_name":
    ensure  =>  running,
    enable  =>  true,
    require =>  Package["$sshd::sshd_pkg_name"],
  }

}
