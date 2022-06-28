class auditd::audispd {
  package { "$auditd::audisp_pkg":
    ensure  =>  installed,
    require =>  Package['auditd'],
  }

  $remote_server  =   {'remote_server' => $auditd::audisp_remote_server}
  $settings_hash = merge($remote_server,$auditd::custom_audisp_configs)
  $settings = join_keys_to_values($settings_hash,':')

  # This is needed because simplevars.lns seems to have a "bug"
  # where if the value exists already without a value, writing a new
  # value fails.
  augeas { 'Remove empty remote_server from audisp-remote.conf':
    incl    =>  "$auditd::audisp_remote_conf",
    lens    =>  'simplevars.lns',
    changes =>  'rm remote_server',
    onlyif  =>  'match remote_server[.=""] size > 0',
    alias   =>  'rm_remote_server',
    require =>  Package["$auditd::audisp_pkg"],
  }

  # auditd.conf settings
  auditd::do_simple_vars { $settings:
    file        =>  "$auditd::audisp_remote_conf",
    lens        =>  'simplevars.lns',
    require     =>  Augeas['rm_remote_server'],
    set_comment =>  $auditd::set_comments,
  }
}
