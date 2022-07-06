define chronyd_client::server (
  $server           = $name,
  $server_opts      = {},
  $all_server_opts  = {},
  $use_defaults     = undef
) {
  include chronyd_client

  $real_use_defaults = $use_defaults ? {
    undef   =>  $chronyd_client::use_defaults,
    default =>  $use_defaults
  }

  validate_bool($real_use_defaults)
  validate_hash($server_opts)
  validate_hash($all_server_opts)

  if $real_use_defaults {
    $server_opt_defaults = $chronyd_client::server_opt_defaults
  } else {
    $server_opt_defaults = {}
  }

  $base_opts = merge($all_server_opts, $server_opts)
  if size($base_opts) > 0 {
    $check_opts = keys($base_opts)
    $send_check_opts = prefix($check_opts, "${server}_")
    $valid_server_opts  = $chronyd_client::valid_server_opts
    validate_chrony_server_opts { $send_check_opts:
      valid_opts  =>  $valid_server_opts,
    }
  }

  $combined_server_opts = merge($server_opt_defaults,$base_opts)

  concat::fragment { "${chronyd_client::conf_file}_server_${server}":
    target  =>  $chronyd_client::conf_file,
    content =>  template('chronyd_client/_server.erb'),
    order   =>  10,
  }

  if has_key($server_opts,'key') {
    unless size($chronyd_client::keys) > 0 {
      fail('The $keys parameter must be provided when specifying a server key')
    }
    realize File["$chronyd_client::config::keyfile"]
  }
}

define validate_chrony_server_opts ( $valid_opts ){
  $tmp_opt = split($name,'_')
  $server = $tmp_opt[0]
  $check_opt = $tmp_opt[1]
  #notify { "checking $server - $check_opt in list $valid_opts": }
  validate_re($check_opt, $valid_opts)
}
