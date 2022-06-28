class smb_client::config {
  file { "$smb_client::smb_config":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "0644",
    content =>  template('smb_client/smb.conf.erb'),
    require =>  Package["$smb_client::smb_pkg"],
  }
}
