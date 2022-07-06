class aide::config {

  if $aide::use_defaults {
    $all_defines = merge($aide::default_defines,$aide::custom_defines)
    $all_config_opts = merge($aide::default_config_opts,$aide::custom_config_opts)
    $all_aliases = merge($aide::default_aliases,$aide::custom_aliases)
    $all_watch_rules = merge($aide::default_watch_rules,$aide::custom_watch_rules)
  } else {
    $all_defines = $aide::custom_defines
    $all_config_opts = $aide::custom_config_opts
    $all_aliases = $aide::custom_aliases
    $all_watch_rules = $aide::custom_watch_rules
  }

  file { "$aide::aide_config":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "0600",
    content =>  template('aide/aide.conf.erb'),
    require =>  Package["$aide::aide_pkg"],
  }

  if $aide::initialize {
    exec { 'Initialize AIDE Database':
      command     =>  "/usr/bin/mv $aide::aide_db_new $aide::aide_db",
      onlyif      =>  "$aide::aide_init",
      refreshonly =>  true,
      subscribe   =>  File["$aide::aide_config"]
    }
  }

  file { "/etc/cron.${aide::run_frequency}/aide":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "0700",
    content =>  template('aide/aide.cron.erb'),
    require =>  Package["$aide::aide_pkg"],
  }
}
