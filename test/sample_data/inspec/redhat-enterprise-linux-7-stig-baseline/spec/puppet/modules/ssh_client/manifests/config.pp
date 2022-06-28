class ssh_client::config {

  if size($ssh_client::host_settings) > 0 {
    create_resources(ssh_client::ssh_host_entry,$ssh_client::host_settings)
  } else {
    notify { "No custom settings provided, doing nothing.": }
  }

  file { "$ssh_client::ssh_client_config":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "0644",
    source  =>  'puppet:///modules/ssh_client/ssh_config.default',
    replace =>  false,
    require =>  Package["$ssh_client::ssh_pkg_name"],
  }
}
