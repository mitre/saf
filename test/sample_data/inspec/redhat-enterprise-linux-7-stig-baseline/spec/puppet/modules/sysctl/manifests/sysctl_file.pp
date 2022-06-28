define sysctl::sysctl_file (
  $priority   = 90,
  $settings,
  $label      = undef,
) {
  include sysctl

  if ! $sysctl::sysctl_d_dir {
    fail ("sysctl.d directory not provided or not supported by this OS.")
  }

  $file_base = $label ? {
    undef     =>  $title,
    default   =>  $label
  }

  $new_file = "${sysctl::sysctl_d_dir}/${priority}-${file_base}${sysctl::sysctl_suffix}"

  if $priority <= $sysctl::system_max_priority {
    notify { "Sysctl priority notification":
      message =>  "The provided priority is less than default system configuration files.\
If you intend to overwrite values the provided priority needs to be higher than ${sysctl::system_max_priority}.",
      before  =>  File[$new_file],
    }
  }

  file { $new_file:
    ensure  =>  file,
    owner   =>  root,
    group   =>  root,
    mode    =>  '0644',
    content =>  template('sysctl/sysctl_file.erb'),
    notify  =>  Exec['Sysctl Refresh'],
  }

  exec { 'Sysctl Refresh':
    command     =>  "${sysctl::reload_cmd}",
    refreshonly =>  true,
  }
}
