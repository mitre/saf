class auditd::config {
  # Set the system for augenrules or not
  if $auditd::systemd {
    $source_file = $auditd::use_augenrules ? {
      true  =>  'puppet:///modules/auditd/auditd_ar.service',
      false =>  'puppet:///modules/auditd/auditd_noar.service',
    }

    exec { 'Reload systemd':
      command     =>  '/bin/systemctl daemon-reload',
      subscribe   =>  File[$auditd::control_file],
      refreshonly =>  true,
      notify      =>  Service["$auditd::service_name"],
      onlyif      =>  '/bin/systemctl enable auditd.service',
    }

    file { $auditd::control_file:
      ensure  =>  file,
      mode    => "0644",
      backup  => true,
      source  => $source_file,
    }
  } else {
    $control_changes = $auditd::use_augenrules ? {
      true  =>  'set USE_AUGENRULES "yes"',
      false =>  'set USE_AUGENRULES "no"',
    }

    augeas { "Set augenrules in $auditd::control_file":
      incl    =>  $auditd::control_file,
      lens    =>  $auditd::control_lens,
      changes =>  $auditd::control_changes,
      notify  =>  Service["$auditd::service_name"],
    }
  }
  # Augenrules config end

  if $auditd::space_left_pct {
    $dynamic_space_left = floor(($auditd::space_left_pct * $::audit_space_mb) / 100)
    $dynamic_space_settings = {'space_left' => $dynamic_space_left}
  } else {
    $dynamic_space_settings = {}
  }

  $modified_auditd_configs = merge($auditd::custom_auditd_configs, $dynamic_space_settings)
  $settings = join_keys_to_values($modified_auditd_configs,':')

  # auditd.conf settings
  auditd::do_simple_vars { $settings:
    file        =>  $auditd::auditd_conf,
    lens        =>  'simplevars.lns',
    require     =>  Package[$auditd::package_name],
    notify      =>  Service["$auditd::service_name"],
    set_comment =>  $auditd::set_comments,
  }

  if !$auditd::use_augenrules {
    concat { "$auditd::auditd_rules_file":
      ensure  =>  present,
      mode    =>  '0600',
      owner   =>  'root',
      group   =>  'root',
      notify  =>  Service["$auditd::service_name"],
      require =>  Package["$auditd::package_name"],
    }
  }

  file { "$auditd::auditd_rulesd_dir":
    ensure  =>  directory,
    purge   =>  true,
    recurse =>  true,
  }

  auditd::rules { 'pre':
    priority  =>  '01',
    content   =>  template('auditd/01-pre.rules.erb'),
  }

  if $auditd::do_suid_files { 
    $local_suid_list = suffix(prefix(split($::suid_list,':'),"$auditd::suid_sgid_prefix"),"${auditd::suid_sgid_suffix}setuid")
    auditd::rules { 'suid-files':
      priority  =>  '50',
      rules     =>  $local_suid_list,
      header    =>  'Monitor execution of SUID files on the system',
    }
  }

  if $auditd::do_sgid_files {
    $local_sgid_list = suffix(prefix(split($::sgid_list,':'),"$auditd::suid_sgid_prefix"),"${auditd::suid_sgid_suffix}setgid")
    auditd::rules { 'sgid-files':
      priority  =>  '60',
      rules     =>  $local_sgid_list,
      header    =>  'Monitor execution of SGID files on the system',
    }
  }

  auditd::rules { 'post':
    priority  =>  '99',
    content   =>  template('auditd/99-post.rules.erb'),
  }

}
