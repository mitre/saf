class profiles::rhel7::base (
  $set_comments            = $profiles::set_comments,
  $sshd_options            = hiera_hash('profiles::rhel7::base::merged::sshd_options'),
  $system_tz               = hiera('profiles::rhel7::base::system_timezone', 'UTC'),
  $sshd_priv_key_mode,
  $sshd_pub_key_mode,
  $sssd_config_nsswitch,
  $sssd_exclude_list       = hiera_array('profiles::rhel7::base::merged::sssd_exclude_list',[]),
  $sssd_purge_confd,
  $sssd_include_services   = hiera_array('profiles::rhel7::base::merged::sssd_include_services'),
  $sssd_enable_domains     = hiera_array('profiles::rhel7::base::merged::sssd_enable_domains'),
  $sssd_configs            = hiera_hash('profiles::rhel7::base::merged::sssd_configs',{}),
  $pam_sssd_enabled,
  $pwquality_settings      = hiera_hash('profiles::rhel7::base::merged::pwquality_settings'),
  $chronyd_server_opts     = hiera_hash('profiles::rhel7::base::merged::chronyd_server_opts'),
  $chronyd_keys,
  $chronyd_servers,
  $ssh_options             = hiera_hash('profiles::rhel7::base::merged::ssh_options'),
  $required_packages       = hiera_array('profiles::rhel7::base::merged::required_packages'),
  $prohibited_packages     = hiera_array('profiles::rhel7::base::merged::prohibited_packages'),
  $yum_config              = hiera_hash('profiles::rhel7::base::merged::yum_config'),
  $aide_custom_aliases     = hiera_hash('profiles::rhel7::base::merged::aide_custom_aliases'),
  $aide_validation_freq,
  $issue_content,
  $mod_curr_users,
  $user_props              = hiera_hash('profiles::rhel7::base::merged::user_props'),
  $mod_homedirs,
  $homedir_mode,
  $sudoers_stig_enabled,
  $exclude_sudoers,
  $sudoers_files           = hiera_hash('profiles::rhel7::base::merged::sudoers_files',{}),
  $sudoers_purge_exclude   = hiera_array('profiles::rhel7::base::merged::sudoers_purge_exclude',[]),
  $sudoers_stig_exclude    = hiera_array('profiles::rhel7::base::merged::sudoers_stig_exclude',[]),
  $users_to_remove         = hiera_array('profiles::rhel7::base::merged::users_to_remove'),
  $exclude_users           = hiera_array('profiles::rhel7::base::merged::exclude_users',[]),
  $managed_users           = hiera_array('profiles::rhel7::base::merged::managed_users',[]),
  $login_defs_settings     = hiera_hash('profiles::rhel7::base::merged::login_defs_settings'),
  $libuser_settings        = hiera_hash('profiles::rhel7::base::merged::libuser_settings'),
  $useradd_settings        = hiera_hash('profiles::rhel7::base::merged::useradd_settings'),
  $sysctl_custom_configs   = hiera_hash('profiles::rhel7::base::merged::sysctl_custom_configs'),
  $grub2_password,
  $install_mods            = hiera_array('profiles::rhel7::base::merged::install_mods'),
  $selinux_mode,
  $selinux_type,
  $rsyslog_cron_file,
  $rsyslog_cron_content,
  # cron_allow_perms in the form '<user>:<group>:<mode>'
  $cron_allow_perms,
  $cron_allow_users        = hiera_array('profiles::rhel7::base::merged::cron_allow_users',['root']),
  $services_to_disable     = hiera_array('profiles::rhel7::base::merged::services_to_disable'),
  $auditd_failure_mode,
  $auditd_custom_configs   = hiera_hash('profiles::rhel7::base::merged::auditd_custom_configs'),
  $auditd_space_left_pct,
  $auditd_extra_rule_sets  = hiera_hash('profiles::rhel7::base::merged::auditd_extra_rule_sets'),
  $audisp_remote_server,
  $audisp_custom_configs   = hiera_hash('profiles::rhel7::base::merged::audisp_custom_configs'),
  $rsyslog_rm_directives   = hiera_hash('profiles::rhel7::base::merged::rsyslog_rm_directives'),
  $limits_stig_fragment    = hiera_array('profiles::rhel7::base::merged::limits_stig_fragment'),
  $profiled_stig_content,
  $pam_password_auth_lines,
  $pam_system_auth_lines,
  $pam_postlogin_lines,
  $pam_misc_files          = hiera_hash('profiles::rhel7::base::merged::pam_misc_files',{}),
  $home_dir_mount_opts     = hiera_hash('profiles::rhel7::base::merged::home_dir_mount_opts'),
  $media_dir_mount_opts    = hiera_hash('profiles::rhel7::base::merged::media_dir_mount_opts'),
  $nfs_dir_mount_opts      = hiera_hash('profiles::rhel7::base::merged::nfs_dir_mount_opts'),
  $postfix_restrictions,
  $firewalld_direct_rules  = hiera_hash('profiles::rhel7::base::merged::firewalld_direct_rules',{}),
  $firewall_ports          = hiera_array('profiles::rhel7::base::merged::firewall_ports',[]),
  $systemd_masked_units    = hiera_array('profiles::rhel7::base::merged::systemd_masked_units'),
  # Allow the loginsight installation to be skipped by supplying a default for server
  # A 'non-value' can be supplied to Hiera as '~' or 'null'. 
  $loginsight_server       = undef,
  $loginsight_package,
  $loginsight_service,
  $loginsight_config       = '/var/lib/loginsight-agent/liagent.ini',
  $ipv6_automatic,
  $ipv6_restart_if         = true,
  # Allow the gugent agent install to be skipped by supplying a default for the server.
  $gugent_vra_server       = undef,
  $gugent_trust_cert       = undef,
) inherits profiles {
  # Create a run stage for items that need to run late/last
  stage { 'pre':
    before => Stage['main'],
  }

  stage { 'near_last':
    require =>  Stage['main'],
  }

  stage { 'finalize':
    require =>  Stage['near_last']
  }

  # Set the system timezone
  file { '/etc/localtime':
    ensure => link,
    target => "/usr/share/zoneinfo/${system_tz}",
  }

  # Assume that 'ipv6_default_gateway' is set as a fact on the host
  class { 'add_ipv6':
    default_gateway => $::ipv6_default_gateway,
    automatic       => $ipv6_automatic,
    set_comments    => $set_comments,
    stage           => 'pre',
    restart_if      => $ipv6_restart_if,
  } 

  class { 'sshd':
    priv_key_mode   => $sshd_priv_key_mode,
    pub_key_mode    => $sshd_pub_key_mode,
    custom_settings => $sshd_options,
    set_comments    => $set_comments,
  }

  class { 'ssh_client':
    host_settings => $ssh_options,
    set_comments  => $set_comments,
  }

  class { 'sssd':
    enable_domains  => $sssd_enable_domains,
    config_nsswitch => $sssd_config_nsswitch,
    exclude_list    => $sssd_exclude_list,
    purge_confd     => $sssd_purge_confd,
    enable_services => $sssd_include_services,
  }

  if size($sssd_configs) > 0 {
    create_resources('sssd::config_file',$sssd_configs)
  }

  class { 'pam':
    password_auth_lines       => $pam_password_auth_lines,
    system_auth_lines         => $pam_system_auth_lines,
    sssd_enabled              => $pam_sssd_enabled,
    pwquality_custom_settings => $pwquality_settings,
    set_comments              => $set_comments,
  }
  pam::limits_fragment { $limits_stig_fragment:
    set_comment => $set_comments,
    shortname   => 'stig',
  }
  pam::pam_file { 'postlogin':
    ensure => file,
    lines  => $pam_postlogin_lines,
  }
  # Add other miscellaneous files defined
  create_resources('pam::pam_file',$pam_misc_files)

  class { 'chronyd_client':
    server_extra_opts => $chronyd_server_opts,
    keys              => $chronyd_keys,
    servers           => $chronyd_servers,
  }

  class { 'yum':
    custom_settings => $yum_config,
    install_pkgs    => $required_packages,
    remove_pkgs     => $prohibited_packages,
    set_comments    => $set_comments,
  }

  class { 'issue':
    content => $issue_content,
  }

  class { 'sudo':
    stig_enabled    => $sudoers_stig_enabled,
    exclude_sudoers => $exclude_sudoers,
    purge_exclude   => $sudoers_purge_exclude,
    stig_exclude    => $sudoers_stig_exclude,
  }

  if size($sudoers_files) > 0 {
    create_resources('sudo::create_files',$sudoers_files)
  }

  class { 'users':
    mod_curr_users             => $mod_curr_users,
    user_props                 => $user_props,
    mod_homedirs               => $mod_homedirs,
    homedir_mode               => $homedir_mode,
    remove_users               => $users_to_remove,
    exclude_users              => $exclude_users,
    managed_users              => $managed_users,
    login_defs_custom_settings => $login_defs_settings,
    libuser_custom_settings    => $libuser_settings,
    useradd_custom_settings    => $useradd_settings,
    set_comments               => $set_comments,
  }

  class { 'sysctl':
    custom_settings => $sysctl_custom_configs,
    set_comments    => $set_comments,
  }

  class { 'grub2pass':
    grub_pass => $grub2_password,
  }

  kmod::install { $install_mods: }

  class { 'selinux':
    mode         => $selinux_mode,
    type         => $selinux_type,
    set_comments => $set_comments,
  }

  class { 'rsyslog':
    rm_directives => $rsyslog_rm_directives,
  }
  rsyslog::fragment { $rsyslog_cron_file:
    content => $rsyslog_cron_content,
  }

  $cron_perms = split($cron_allow_perms,':')
  class { 'cron':
    cron_allow => 'present',
    # Remove cron.deny as it has no effect when cron.allow is present
    cron_deny        => 'absent',
    cron_allow_owner => $cron_perms[0],
    cron_allow_group => $cron_perms[1],
    cron_allow_mode  => $cron_perms[2],
    cron_allow_users => $cron_allow_users,
  }

  service { $services_to_disable:
    ensure => stopped,
    enable => false,
  }

  class { 'auditd':
    failure_mode          =>  $auditd_failure_mode,
    audisp_remote_server  =>  $audisp_remote_server,
    custom_audisp_configs =>  $audisp_custom_configs,
    custom_auditd_configs =>  $auditd_custom_configs,
    space_left_pct        =>  $auditd_space_left_pct,
    do_suid_files         =>  true,
    do_sgid_files         =>  true,
    set_comments          =>  $set_comments,
  }

  create_resources('auditd::rules', $auditd_extra_rule_sets)

  file { '/etc/profile.d/stig.sh':
    ensure  =>  file,
    owner   =>  'root',
    group   =>  'root',
    mode    =>  '0644',
    content =>  $profiled_stig_content,
  }

  ensure_resources('mount',$home_dir_mount_opts)
  ensure_resources('mount',$media_dir_mount_opts)
  ensure_resources('mount',$nfs_dir_mount_opts)

  exec { 'Set Postfix access restrictions':
    command =>  "/usr/sbin/postconf -e \'smtpd_client_restrictions = ${postfix_restrictions}\'",
    unless  =>  "/usr/sbin/postconf -n smtpd_client_restrictions | grep \"${postfix_restrictions}\$\"",
  }

  include firewalld
  ensure_resources('firewalld_direct_rule',$firewalld_direct_rules)
  $firewall_ports_hash = array_to_hash($firewall_ports)
  create_resources('profiles::firewall_ports', $firewall_ports_hash)

  mask_systemd_units { $systemd_masked_units: }

  if $loginsight_server != undef {
    # Dirty way to enforce the installation of Log Insight. I'd prefer to build
    # a module but the Log Insight RPM configures certain things in the config file
    # (/var/lib/loginsight/liagent.ini) and the server manages after we connect.
    # This is currently the recommended installation method. We need to use 'exec'
    # because we have to set an environment variable: SERVERHOST.
    exec { 'Install VMware Log Insight':
      environment => ["SERVERHOST=${loginsight_server}"],
      command     => "/usr/bin/yum install -y ${loginsight_package} 2>&1 >> /dev/null",
      unless      => "/bin/rpm -q ${loginsight_package} 2>&1 >> /dev/null",
    } ->
    exec { 'RE-Install VMware Log Insight':
      environment => ["SERVERHOST=${loginsight_server}"],
      command     => "/usr/bin/yum reinstall -y ${loginsight_package} 2>&1 >> /dev/null",
      unless      => "/usr/bin/grep -q ${loginsight_server} ${loginsight_config} 2>&1 >> /dev/null",
    } ->
    service { $loginsight_service:
      ensure => running,
      enable => true,
    }
  } else {
    # If a server is not provided, remove the LogInsight package
    package { $loginsight_package:
      ensure => absent,
    }
  }

  class { 'aide':
    custom_aliases => $aide_custom_aliases,
    run_frequency  => $aide_validation_freq,
    stage          => 'near_last',
  }

  # Notify VRA after everything complete, if system was deployed by VRA
  class { 'vmware_gugent':
    vra_server => $gugent_vra_server,
    trust_cert => $gugent_trust_cert,
    stage      => 'finalize',
  }
}

define mask_systemd_units {
  exec { "Mask Systemd Unit ${name}":
    command => "/usr/bin/systemctl mask ${name}",
    unless  => "/bin/ls -l /etc/systemd/system/${name} | grep /dev/null",
  }
}
