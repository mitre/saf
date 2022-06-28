class pam::service {
  if $pam::sssd_enabled {
    service { "$pam::oddjob_svc":
      ensure  =>  running,
      enable  =>  true,
      require =>  Package["$pam::oddjob_pkg"],
    }
  }
}
