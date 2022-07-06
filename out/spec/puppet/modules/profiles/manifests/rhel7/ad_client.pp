# == Class: profiles::rhel7::ad_client
#
# This is a site-specific module used to orchestrate the other pieces required
# to join a RHEL6/7 system to Active Directory.
#
# === Parameters
#
# [*ad_domain*]
#   This required parameter configures the name of the AD domain to which to bind.
#
# [*gpo_enforcing*]
#   Boolean specifying whether or not to enforce GPO for logon to the system(s).
#   Default: true
#
# [*join_pass*]
#   Password used to join a host to the Active Directory domain. This must be used
#   in conjunction with 'join_user' to have an effect.
#
# [*join_user*]
#   User used to join the host to the Active Directory domain. This must be used in
#   conjunction with 'join_pass' to have an effect.
#
# [*nix_ou*]
#   The bottom-level OU container into which to add this host.
#
# [*nix_ou_base*]
#   The directory path to the 2nd level OU container for managed Nix hosts.
#
# [*priority*]
#   Numeric priority used for the deployed sssd configuration file. This value should be
#   coordinated with other sssd configurations to ensure expected sssd behavior.
#
# [*sssd_confd_dir*]
#   The OS-specific location of the sssd conf.d directory to which to deploy the sssd
#   configuration.
#
# === Variables
#
# None
#
# === Examples
#
#  class { 'ad_client':
#    servers => [ 'pool.ntp.org', 'ntp.local.company.com' ],
#  }
#
# === Authors
#
# Author Lesley Kimmel <author@domain.com>
#
# === Copyright
#
# Copyright 2017 Lesley Kimmel, unless otherwise noted.
#
class profiles::rhel7::ad_client (
  $set_comments         = $profiles::set_comments,
  $ad_domain,
  $join_user,
  $join_pass,
  $nix_ou               = undef,
  $sssd_priority,
  $sssd_label,
  $krb5_realm,
  $krb5_include_sssd,
  $smb_workgroup,
  $sshd_settings        = hiera_hash('profiles::rhel7::ad_client::merged::sshd_settings'),
  $sssd_domain_options  = hiera_hash('profiles::rhel7::ad_client::merged::sssd_domain_options'),
  $sssd_service_options = hiera_hash('profiles::rhel7::ad_client::merged::sssd_service_options'),
  $update_dns           = false,
  $user_files           = {},
) inherits profiles {
  include profiles::rhel7::base
  
  validate_bool($update_dns)
  validate_hash($user_files)

  # Management of specified file content in local user home directories
  $local_users_hash = merge(parsejson($::local_user_info), parsejson($::system_user_info))
  $local_users = keys($local_users_hash)
  $passed_users = keys($user_files)
  $valid_users = intersection($passed_users, $local_users)
  ::users::user_files { $valid_users:
    user_data => $user_files,
  }

  if $update_dns {
    $dns_option = ''
  } else {
    $dns_option = ' --no-dns-updates'
  }

  if $nix_ou {
    $join_command = "/bin/net ads join -U \'${join_user}%${join_pass}\'${dns_option} createcomputer=\'${nix_ou}\'"
  } else {
    $join_command = "/bin/net ads join -U \'${join_user}%${join_pass}\'${dns_option}"
  }

  class { 'smb_client':
    krb5_realm => $krb5_realm,
    workgroup  => $smb_workgroup,
  }

  class { 'krb5_client':
    krb5_default_realm => $krb5_realm,
    include_sssd       => $krb5_include_sssd,
  }

  # Class['sssd']: config_nsswitch=true
  # NOTE: sssd has an implicit dependency based on the notify from local File resource
  sssd::config_file { "${sssd_priority}_${sssd_label}":
    priority     => $sssd_priority,
    label        => $sssd_label,
    domain       => $ad_domain,
    domain_opts  => $sssd_domain_options,
    service_opts => $sssd_service_options,
  }

  # Class['pam']: sssd_enabled=true
  # --Included via the profiles::base class

  # Be sure to pass the following parameters to override base settings:
  # 'ChallengeResponseAuthentication': 'yes'
  # 'GSSAPIAuthentication': 'yes'
  # 'GSSAPICleanupCredentials': 'yes'
  sshd::sshd_settings { 'SSHD settings for AD_Client Profile':
    settings    => $sshd_settings,
    set_comment => $set_comments,
  }

  # NOTE: Don't include sssd as a prerequisite because it is implicitly included
  # by the file resource below and including here causes a dependency cycle.
  Class['smb_client','krb5_client','pam'] -> Class['profiles::rhel7::ad_client']

  exec { 'JoinDomain':
    command => $join_command,
    unless  => '/bin/net ads testjoin',
    notify  => Service[$sssd::sssd_svc],
  }

  $sssd_confd_dir = $sssd::confd_dir
  File["${sssd_confd_dir}/${sssd_priority}_${sssd_label}.conf"] -> Exec['JoinDomain']
}
