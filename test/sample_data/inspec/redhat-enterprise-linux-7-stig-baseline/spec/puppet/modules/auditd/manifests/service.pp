class auditd::service {
  service { "$auditd::service_name":
    enable  =>  true,
    ensure  =>  running,
    stop    =>  $auditd::svc_stop_cmd,
    restart =>  $auditd::svc_restart_cmd,
    require =>  Package['auditd'],
  }
}
