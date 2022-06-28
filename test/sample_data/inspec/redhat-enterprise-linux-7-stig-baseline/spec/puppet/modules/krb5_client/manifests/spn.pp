define krb5_client::spn (
  $notify_svc    = [],
) {
  $primary_spn    = upcase("$hostname\$")

  exec { "spn_${name}":
    path    => ["/bin:/usr/bin"],
    command => "kinit -kt /etc/krb5.keytab $primary_spn ; net ads keytab add $name -k",
    unless  => "klist -kt /etc/krb5.keytab | grep \"${name}/.*@.*\"",
    notify  => Service[$notify_svc],
  }
}

