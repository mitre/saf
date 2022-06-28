class grub2pass::config {
  file { "${grub2pass::grubd_file}":
    ensure  =>  file,
    owner =>  "root",
    group =>  "root",
    mode    =>  "0755",
    content =>  template('grub2pass/grub_users.erb'),
    notify  =>  Exec['Rebuild GRUB Config'],
  } 

  exec { 'Rebuild GRUB Config':
    command     =>  "${grub2pass::mk_grub_cmd}",
    refreshonly =>  true,
  }
}
