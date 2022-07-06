class vmware_gugent::config {
  if $vmware_gugent::umask {
    validate_re($vmware_gugent::umask,'^noumask$')
    exec { "Disabling umask in VRM_daemon.pl":
      command   =>  "sed -i -e 's/umask/#umask/g' ${vmware_gugent::install_path}/VRM_daemon.pl"
    }
  }

  $mod_files =  [
                "/usr/bin/gugent",
                "${vmware_gugent::install_path}/vrm-agent",
                "${vmware_gugent::install_path}/vrm-agentd",
                "${vmware_gugent::install_path}/VRM_daemon.pl",
                "${vmware_gugent::install_path}/rungugent.sh",
                "${vmware_gugent::install_path}/postmortem.sh",
                ]

  file { $mod_files:
    owner   =>  'root',
    group   =>  'root',
    mode    =>  'a+x',
  }

  file { "${vmware_gugent::install_path}/cert.pem":
    ensure  =>  file,
    content =>  file("$vmware_gugent::trust_cert"),
    owner   =>  'root',
    group   =>  'root',
    mode    =>  '0644',
  }

  file { "${vmware_gugent::install_path}/rungugent.properties":
    ensure  =>  file,
    owner   =>  'root',
    group   =>  'root',
    mode    =>  '0644',
    content =>  template('vmware_gugent/rungugent.properties.erb'),
  }

  file { '/usr/share/log':
    ensure  =>  directory,
    owner   =>  'root',
    group   =>  'root',
    mode    =>  '0755',
  }
}
