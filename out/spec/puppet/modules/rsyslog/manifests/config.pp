class rsyslog::config {
  $new_settings = join_keys_to_values($rsyslog::conf_directives,':')
  $removes = join_keys_to_values($rsyslog::rm_directives,':')

  do_remove { $removes: }
 
  rsyslog::do_simple_vars{ $new_settings:
    file         =>  "$rsyslog::conf_file",
    lens         =>  'rsyslog.lns',
    require      =>  File["$rsyslog::conf_file"],
    set_comment  =>  $rsyslog::set_comments,
    notify       =>  Service["$rsyslog::svc_name"],
  }

  file { "$rsyslog::conf_file":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "$rsyslog::conf_file_mode",
    require =>  Package["$rsyslog::pkg_name"],
  }

  file { "$rsyslog::confd_dir":
    ensure  =>  directory,
    owner   =>  "root",
    group   =>  "root",
    purge   =>  "$rsyslog::purge_confd",
    backup  =>  true,
    ignore  =>  $rsyslog::purge_excludes,
    require =>  Package["$rsyslog::pkg_name"],
    notify  =>  Service["$rsyslog::svc_name"],
  }
}

define do_remove {
  $parts = split($name,':')
  $option = $parts[0]
  $option_esc = shell_escape($option)
  $value = $parts[1]
  $msg = "THIS OPTION ($option $value) IS MANAGED BY PUPPET - DO NOT MODIFY!!"
  augeas { "Delete $option $value from $rsyslog::conf_file":
    incl     =>  "$rsyslog::conf_file",
    lens     =>  'rsyslog.lns',
    require  =>  File["$rsyslog::conf_file"],
    notify   =>  Service["$rsyslog::svc_name"],
    changes  =>  [
                 "rm $option_esc[.=\"$value\"]",
                 "rm #comment[.=\"$msg\"]",
                 "rm #comment[.=\"$option $value\"]",
                 ],
  }
}
