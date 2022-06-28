class profiles::rhel7::oracle_db::storage {
  # Set variables required for the rest of the resources
  $oracle_disks = parsejson($::disk_mapping)
  $grid_owner_name = $profiles::rhel7::oracle_db::grid_owner_name

  # Deploy the disk creation script
  file { 'Oracle RAC Shared Disks':
    ensure  => file,
    path    => '/usr/local/sbin/mk_ora_asm_disks.sh',
    owner   => 'root',
    group   => 'root',
    mode    => '0700',
    content => template('profiles/oracle_db/oracle_disks.sh.erb'),
  } ~> Exec['Make Oracle ASM Disks']

  # Deploy the UDEV rules
  file { 'Oracle RAC ASM Disk UDEV Rules':
    ensure  => file,
    path    => '/etc/udev/rules.d/70-oracle-asm-scsi.rules',
    owner   => 'root',
    group   => 'root',
    mode    => '0600',
    content => template('profiles/oracle_db/oracle_udev_rule.erb'),
    require => [File['Oracle RAC Shared Disks'],User[$grid_owner_name]],
  } ~> Exec['Make Oracle ASM Disks']

  # Trigger UDEV to create the disks
  exec { 'Make Oracle ASM Disks':
    command     => '/sbin/udevadm trigger',
    refreshonly => true,
  }
}
