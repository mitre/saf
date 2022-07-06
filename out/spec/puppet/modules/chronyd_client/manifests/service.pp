class chronyd_client::service {
  $svc_ensure = $chronyd_client::enabled ? {
    true  => 'running',
    false => 'stopped',
  }

  service { "$chronyd_client::svc_name":
    ensure    =>  $svc_ensure,
    enable    =>  $chronyd_client::enabled,
  }
}
