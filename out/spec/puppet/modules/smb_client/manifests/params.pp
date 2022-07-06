class smb_client::params {
  case $::osfamily {
    'Redhat': {
      $smb_config = '/etc/samba/smb.conf'
      $smb_pkg = 'samba-common'
      $smb_tools_pkg = 'samba-common-tools'
    }
  }
}
