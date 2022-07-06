class sssd::config {
  file { "$sssd::sssd_conf":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "0600",
    content =>  template('sssd/sssd.conf.erb'),
    require =>  Package["$sssd::sssd_pkg"],
    notify  =>  Service["$sssd::sssd_svc"],
  }

  file { "${sssd::confd_dir}":
    ensure  =>  directory,
    recurse =>  true,
    purge   =>  "$sssd::purge_confd",
    ignore  =>  $sssd::exclude_list,
    require =>  Package["$sssd::sssd_pkg"],
    notify  =>  Service["$sssd::sssd_svc"],
  }

  if $sssd::config_nsswitch {
    augeas { "Adding sssd to ${sssd::nsswitch_file}":
      incl  =>  "$sssd::nsswitch_file",
      lens  =>  'nsswitch.lns',
      changes =>  [
                  'set database[.="passwd"] passwd',
                  'set database[.="passwd"]/service[.="sss"] sss',
                  'set database[.="shadow"] shadow',
                  'set database[.="shadow"]/service[.="sss"] sss',
                  'set database[.="group"] group',
                  'set database[.="group"]/service[.="sss"] sss',
                  'set database[.="services"] services',
                  'set database[.="services"]/service[.="sss"] sss',
                  'set database[.="netgroup"] netgroup',
                  'set database[.="netgroup"]/service[.="sss"] sss',
                  'set database[.="automount"] automount',
                  'set database[.="automount"]/service[.="sss"] sss',
                  ],
      require =>  Package["$sssd::sssd_pkg"],
    }
  }
}
