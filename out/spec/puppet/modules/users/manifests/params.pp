class users::params {
  case $::osfamily {
    'RedHat': {
      $user_defaults          = {
                                'ensure'      =>  present,
                                'shell'       =>  '/bin/bash',
                                }
      # Do not use trailing slash
      $homedir_prefix         = '/home'
      $homedir_mode           = 'g-w,o-rwx'
      $crontab_base           = '/var/spool/cron'
      $mail_base              = '/var/spool/mail'
      #
      $login_defs_conf_file   = '/etc/login.defs'
      $login_defs_stig_opts   = {
                                'ENCRYPT_METHOD'  =>  'SHA512',
                                'PASS_MIN_DAYS'   =>  '1',
                                'PASS_MAX_DAYS'   =>  '60',
                                'FAIL_DELAY'      =>  '4',
                                'UMASK'           =>  '077',
                                'CREATE_HOME'     =>  'yes',
                                }
      $libuser_conf_file      = '/etc/libuser.conf'
      # The parameters for libuser.conf should be provided
      # in the form of <section>/<parameter>
      $libuser_stig_opts      = {
                                'defaults/crypt_style' => 'sha512',
                                }
      $useradd_conf_file      = '/etc/default/useradd'
      $useradd_stig_opts      = {
                                'INACTIVE'  =>  '0',
                                }
    }
  }
}
