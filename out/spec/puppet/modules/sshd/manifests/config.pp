class sshd::config {

  sshd::sshd_settings { 'SSHD Settings set from SSHD Class':
    settings     =>  $sshd::custom_settings,
    set_comment  =>  $sshd::set_comments,
  }

  file { "$sshd::sshd_config":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "0600",
    source  =>  'puppet:///modules/sshd/sshd_config.default',
    replace =>  false,
    require =>  Package["$sshd::sshd_pkg_name"],
  }

  $ssh_priv_key_list = split($::local_ssh_priv_keys,',')
  $ssh_pub_key_list = split($::local_ssh_pub_keys,',')
  file { $ssh_priv_key_list:
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "ssh_keys",
    mode    =>  "$sshd::priv_key_mode",
  }

  file { $ssh_pub_key_list:
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "$sshd::pub_key_mode",
  }
}
