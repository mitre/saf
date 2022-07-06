class sysctl::config {

  $settings = join_keys_to_values($sysctl::custom_settings,':')

  sysctl::do_simple_vars{ $settings: 
    file         =>  "$sysctl::sysctl_config",
    lens         =>  'sysctl.lns',
    require      =>  File["$sysctl::sysctl_config"],
    set_comment  =>  $sysctl::set_comments,
    notify       =>  Exec['Reload sysctl parameters'],
  }

  exec { 'Reload sysctl parameters':
    command     =>  "/usr/sbin/sysctl -p",
    refreshonly =>  true,
  }

  file { "$sysctl::sysctl_config":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "0644",
    require =>  Package["$sysctl::sysctl_pkg_name"],
  }
}
