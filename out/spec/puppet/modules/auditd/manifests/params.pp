class auditd::params {

  # Ensure service is set to use appropriate method
  case $::operatingsystemmajrelease {
    '7': {
      $package_name = 'audit'
      $service_name = 'auditd'
      $audisp_pkg   = 'audispd-plugins'
      $audisp_remote_conf = '/etc/audisp/audisp-remote.conf'
      $auditd_conf = '/etc/audit/auditd.conf'
      $auditd_rules_file = '/etc/audit/audit.rules'
      $auditd_rulesd_dir = '/etc/audit/rules.d'
      $systemd = true
      $control_file = '/usr/lib/systemd/system/auditd.service'
      $control_lens = 'systemd.lns'
      $svc_restart_cmd = '/usr/libexec/initscripts/legacy-actions/auditd/restart'
      $svc_stop_cmd = '/usr/libexec/initscripts/legacy-actions/auditd/stop'
      $system_auid = 1000
      $suid_sgid_prefix = '-a always,exit -F path='
      $suid_sgid_suffix = " -F perm=x -F auid>=$system_auid -F auid!=4294967295 -F key="
    }
  }
}
