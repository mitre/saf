class autofs::service {

  service { "$autofs::svc_name":
    ensure  =>  running,
    enable  =>  true,
    require =>  Package["$autofs::svc_name"],
  }

}

