class sudo::params {
  case $::osfamily {
    'RedHat': {
      $sudo_pkg       = 'sudo'
      $lsb_pkg        = 'redhat-lsb-core'
      $sudoers_file   = '/etc/sudoers'
      $sudoersd_dir   = '/etc/sudoers.d'
      $validate_cmd   = '/sbin/visudo -c -f %'
      $file_defaults  = {
                        'ensure'  =>  file,
                        'owner'   =>  'root',
                        'group'   =>  'root',
                        'mode'    =>  '0440',
                        }
    }
  }
}
