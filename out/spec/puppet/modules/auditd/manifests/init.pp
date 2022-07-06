# == Class: auditd
#
# Configure the auditd daemon and the audisp plugin. Supports augenrules
# or standard audit.rules configuration.
#
# === Parameters
#
# [*stig_enabled*]
#   Enable DOD STIG mandated settings to auditd.conf and STIG specified
#   audit rules.
#
# [*immutable*]
#   Whether or not to make the configuration immutable. Setting to true
#   will require a reboot to change.
#
# [*use_augenrules*]
#   (Boolean) Whether or not to use the augenrules (rules.d) method
#   or the combined audit.rules setup. Using augenrules may allow other
#   administrators to add configuration while setting it to false will
#   enforce that only the Puppet deployed file is used.
#
# [*custom_auditd_configs*]
#   This is a hash of key/value pairs that will get added to auditd.conf
#
# [*custom_audisp_configs*]
#   This is a hash of key/value pairs that will get added to audisp-remote.conf
#
# [*buffer_size*]
#   Sets the number (integer) of backlog buffers for the audit system. Set to 320 by
#   default to match the default provided in the OS-provided audit.rules.
#
# [*failure_mode*]
#   Set the failure mode for auditd when buffers are full (see '$ man auditctl')
#   for description of valid values ([0..2])
#
# [*audispd*]
#   (Boolean) Whether or not to enable audispd to send audit events to a remote
#   server.
#
# [*audisp_remote_server*]
#   Remote server to use for forwarding audit events.
#
# [*control_file*]
#   Location of the file that is used to control how the auditd daemon expects
#   to see its configuration. For systemd this is generally the systemd unit
#   file. For SysV (init) this is often /etc/sysconfig/auditd (RHEL)
#
# [*control_lens*]
#   The augeas lens to use based on the control_file format.
#
# [*package_name*]
#   Name of the package used to install auditd
#
# [*svc_restart_cmd*]
#   Specific command used to restart the auditd service. This is important
#   on systemd hosts because systemd does not allow this service to be restarted
#   directly. One has to use legacy scripts to stop and restart it. These
#   scripts are the default so this parameter should rarely need to be used.
#
# [*svc_stop_cmd*]
#   Specific command used to stop the auditd service. This is important
#   on systemd hosts because systemd does not allow this service to be stopped
#   directly. One has to use legacy scripts to stop and restart it. These
#   scripts are the default so this parameter should rarely need to be used.
#
# [*systemd*]
#   (Boolean) Whether or not this system uses systemd as opposed to SysV init.
#
# [*system_auid*]
#   auid value to be used in audit rules to ignore users without a userid
#
# [*custom_rules*]
#   This is a list of strings containing fully specified rules provided
#   by the administrator to be added to the audit rules.
#
# === Variables
#
# [*auditd_stig_settings*]
#   This variable takes on the value of the list of predefined STIG
#   settings for auditd from params.pp. This value is then avaiable to
#   classes included by this class.
#
# [*audisp_stig_settings*]
#   This variable takes on the value of the list of predefined STIG
#   settings for audisp from params.pp. This value is then avaiable to
#   classes included by this class.
#
# [*local_suid_list*]
#   This variable uses the module-provided custom fact 'suid_list'
#   to build a list of locally-detected files with the SUID bit set.
#   This variable is used to build STIG-required rules and is available
#   to classes included by this class
#
# [*local_sgid_list*]
#   This variable uses the module-provided custom fact 'sgid_list'
#   to build a list of locally-detected files with the SGID bit set.
#   This variable is used to build STIG-required rules and is available
#   to classes included by this class
#
# === Examples
#
#  class { 'auditd':
#    audispd      => false,
#    custom_rules => [
#                    '<custom_rule_1>',
#                    '<custom_rule_2>',
#                    ],
#  }
#
# === Authors
#
# Lesley J Kimmel <lesley.j.kimmel@gmail.com>
#
class auditd (
  $immutable                = true,
  # By default disable augenrules to prevent users from
  # merging content not managed by puppet
  $use_augenrules           = false,
  $space_left_pct           = undef,
  $custom_auditd_configs    = {},
  $custom_audisp_configs    = {},
  $buffer_size              = 320,
  $failure_mode             = '2',
  $audisp_remote_server     = undef,
  $audisp_pkg               = $::auditd::params::audisp_pkg,
  $audisp_remote_conf       = $::auditd::params::audisp_remote_conf,
  $control_file             = $::auditd::params::control_file,
  $control_lens             = $::auditd::params::control_lens,
  $package_name             = $::auditd::params::package_name,
  $svc_restart_cmd          = $::auditd::params::svc_restart_cmd,
  $svc_stop_cmd             = $::auditd::params::svc_stop_cmd,
  $service_name             = $::auditd::params::service_name,
  $systemd                  = $::auditd::params::systemd,
  $system_auid              = $::auditd::params::system_auid,
  $auditd_rules_file        = $::auditd::params::auditd_rules_file,
  $auditd_rulesd_dir        = $::auditd::params::auditd_rulesd_dir,
  $auditd_conf              = $::auditd::params::auditd_conf,
  $do_suid_files            = false,
  $do_sgid_files            = false,
  $suid_sgid_prefix         = $::auditd::params::suid_sgid_prefix,
  $suid_sgid_suffix         = $::auditd::params::suid_sgid_suffix,
  $set_comments             = true,
) inherits auditd::params {

  # Define file defaults
  File {
    owner =>  "root",
    group =>  "root",
    mode  =>  "0750",
  }

  validate_bool($use_augenrules)
  validate_bool($immutable)
  validate_bool($systemd)
  validate_bool($do_suid_files)
  validate_bool($do_sgid_files)
  validate_absolute_path($control_file)
  validate_hash($custom_auditd_configs)
  validate_hash($custom_audisp_configs)
  validate_integer($buffer_size)
  if $space_left_pct { validate_integer($space_left_pct,100) }
  validate_re($failure_mode,['0','1','2'])
  #validate_ip_address($audisp_remote_server)

  contain auditd::config

  if $audisp_remote_server {
    validate_string($audisp_remote_server)
    contain auditd::audispd
  }

  package { $package_name:
    ensure  =>  installed,
    alias   =>  'auditd',
  }

  service { 'auditd':
    enable  =>  true,
    ensure  =>  running,
    stop    =>  $svc_stop_cmd,
    restart =>  $svc_restart_cmd,
    require =>  Package['auditd'],
  }
}
