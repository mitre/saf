class grub2pass::params {
  case $::osfamily {
    'RedHat': {
      $grub_cfg         = '/boot/grub2/grub.cfg'
      $grub_user        = 'root'
      $mk_grub_cmd      = "/usr/sbin/grub2-mkconfig -o ${grub_cfg}"
      $grubd_file       = '/etc/grub.d/01_users'
      $grub_passwd_cmd  = 'grub2-mkpasswd-pbkdf2'
    }
  }
}
