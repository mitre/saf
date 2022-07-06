class krb5_client::install {
  package { "$krb5_client::krb5_client_pkg":
    ensure  =>  installed,
  }
}
