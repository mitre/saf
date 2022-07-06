class users::config {
  if $users::manage_login_defs {
    $ld_settings_list = join_keys_to_values($users::login_defs_custom_settings,':')
    users::do_simple_vars { $ld_settings_list:
      file        =>  "$users::login_defs_conf_file",
      lens        =>  'login_defs.lns',
      set_comment =>  $users::set_comments,
    }
  }

  if $users::manage_libuser {
    $lu_settings_list = join_keys_to_values($users::libuser_custom_settings,':')
    users::do_ini_settings { $lu_settings_list:
      file        =>  "$users::libuser_conf_file",
      lens        =>  'yum.lns',
      set_comment =>  $users::set_comments,
    }
  }

  if $users::manage_useradd {
    $ua_settings_list = join_keys_to_values($users::useradd_custom_settings,':')
    users::do_simple_vars { $ua_settings_list:
      file        =>  "$users::useradd_conf_file",
      lens        =>  'shellvars.lns',
      set_comment =>  $users::set_comments,
    }
  }

}
