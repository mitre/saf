class krb5_client::config {
  file { "$krb5_client::krb5_config":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "0644",
    content =>  template('krb5_client/krb5.conf.erb'),
    require =>  Package["$krb5_client::krb5_client_pkg"],
  }
}
