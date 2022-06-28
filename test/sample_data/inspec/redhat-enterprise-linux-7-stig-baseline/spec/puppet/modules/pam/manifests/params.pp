class pam::params {
  case $::osfamily {
    'RedHat': {
      $pam_dir              = '/etc/pam.d'
      $oddjob_pkg           = 'oddjob-mkhomedir'
      $oddjob_svc           = 'oddjobd'
      $sssd_pkg             = 'sssd'
      $pam_remote_config    = "password-auth-local"
      $pam_local_config     = "system-auth-local"
      $pam_remote_link      = "password-auth"
      $pam_local_link       = "system-auth"
      $pwquality_pkg        = 'libpwquality'
      $pwquality_conf_file  = '/etc/security/pwquality.conf'
      $pwquality_valid_opts = [
                              'difok',
                              'minlen',
                              'dcredit',
                              'ucredit',
                              'lcredit',
                              'ocredit',
                              'minclass',
                              'maxrepeat',
                              'maxsequence',
                              'maxclassrepeat',
                              'gecoscheck',
                              'badwords',
                              'dictpath',
                              ]
      $limits_conf_file     = '/etc/security/limits.conf'
      $limits_confd_dir     = '/etc/security/limits.d'
      $limits_purge_exclude = ['20-nproc.conf','*.puppet-bak']
      $limits_file_mode     = '0644'
      $default_auth_lines   = [
                              'auth        required      pam_env.so',
                              'auth        sufficient    pam_unix.so  try_first_pass',
                              'auth        requisite     pam_succeed_if.so uid >= 1000 quiet_success',
                              'auth        required      pam_deny.so',
                              '',
                              'account     required      pam_unix.so',
                              'account     sufficient    pam_localuser.so',
                              'account     sufficient    pam_succeed_if.so uid < 1000 quiet',
                              'account     required      pam_permit.so',
                              '',
                              'password    requisite     pam_pwquality.so try_first_pass local_users_only retry=3 authtok_type=',
                              'password    sufficient    pam_unix.so sha512 shadow  try_first_pass use_authtok',
                              'password    required      pam_deny.so',
                              '',
                              'session     optional      pam_keyinit.so revoke',
                              'session     required      pam_limits.so',
                              '-session     optional      pam_systemd.so',
                              'session     [success=1 default=ignore] pam_succeed_if.so service in crond quiet use_uid',
                              'session     required      pam_unix.so',
                              ]
    }
  }
}
