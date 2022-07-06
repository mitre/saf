class chronyd_client::config {

  concat { $chronyd_client::conf_file:
    ensure  =>  present,
    mode    =>  '0644',
    owner   =>  'root',
    group   =>  'root',
    notify  =>  Service["$chronyd_client::svc_name"],
    require =>  Package["$chronyd_client::pkg_name"],
  }

  concat::fragment { "${chronyd_client::conf_file}_header":
    target  =>  $chronyd_client::conf_file,
    content =>  template('chronyd_client/_header.erb'),
    order   =>  01,
  }

  $server_list = keys($chronyd_client::servers)
  do_servers { $server_list:
    server_hash     => $chronyd_client::servers,
    universal_opts  => $chronyd_client::server_extra_opts,
  }

  $custom_settings_list = keys($chronyd_client::custom_settings)
  validate_client_opts { $custom_settings_list:
    valid_opts  =>  $chronyd_client::valid_opts,
  }

  if $chronyd_client::use_defaults {
    $client_config_defaults = $chronyd_client::client_config_defaults
  } else {
    $client_config_defaults = {}
  }

  $client_settings = merge($chronyd_client::minimal_configs,$client_config_defaults,$chronyd_client::custom_settings)

  concat::fragment { "${chronyd_client::conf_file}_settings":
    target  =>  $chronyd_client::conf_file,
    content =>  template('chronyd_client/_settings.erb'),
    order   =>  100,
  }

  # Declare $keyfile as a virtual resource as it may be realized based on
  # client setting 'commandkey' or server option 'key'
  if has_key($client_settings,'keyfile') {
    $keyfile = $client_settings['keyfile']
  } else {
    $keyfile = $chronyd_client::keyfile
  }

  @file { "$keyfile":
    ensure  =>  file,
    owner   =>  'root',
    group   =>  'chrony',
    mode    =>  '0640',
    content =>  template('chronyd_client/chrony.keys.erb'),
    notify  =>  Service["$chronyd_client::svc_name"],
  }

}

define validate_client_opts ( $valid_opts ){
  validate_re($name, $valid_opts)
}

define do_servers ( $universal_opts, $server_hash ) {
  chronyd_client::server { "${name}":
    server_opts     => $server_hash["${name}"],
    all_server_opts => $universal_opts,
  }
}
