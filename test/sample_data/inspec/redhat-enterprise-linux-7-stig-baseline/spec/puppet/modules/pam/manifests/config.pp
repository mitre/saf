class pam::config {
  pam::pam_file { "$pam::pam_local_config":
    lines  =>  $pam::system_auth_lines,
    ensure =>  file,
  }

  file { "${pam::pam_dir}/${pam::pam_local_link}":
    ensure  =>  symlink,
    target  =>  "${pam::pam_dir}/${pam::pam_local_config}",
    require =>  File["${pam::pam_dir}/${pam::pam_local_config}"],
 }

  pam::pam_file { "$pam::pam_remote_config":
    lines  =>  $pam::password_auth_lines,
    ensure =>  file,
  }

  file { "${pam::pam_dir}/${pam::pam_remote_link}":
    ensure  =>  symlink,
    target  =>  "${pam::pam_dir}/${pam::pam_remote_config}",
    require =>  File["${pam::pam_dir}/${pam::pam_remote_config}"],
  }

  $pq_custom_settings_list = keys($pam::pwquality_custom_settings)
  validate_opts { $pq_custom_settings_list:
    valid_opts  =>  $pam::pwquality_valid_opts,
  }

  $pq_settings_list = join_keys_to_values($pam::pwquality_custom_settings,':')

  pam::do_simple_vars { $pq_settings_list:
    file        =>  "$pam::pwquality_conf_file",
    lens        =>  'simplevars.lns',
    require     =>  Package["$pam::pwquality_pkg"],
    set_comment =>  $pam::set_comments,
  }

  file { "${pam::limits_confd_dir}":
    ensure  =>  directory,
    recurse =>  true,
    purge   =>  $pam::limits_purge_confd,
    ignore  =>  $pam::limits_purge_exclude,
    backup  =>  true,
  }
}

define validate_opts ( $valid_opts ){
  validate_re($name, $valid_opts)
}
