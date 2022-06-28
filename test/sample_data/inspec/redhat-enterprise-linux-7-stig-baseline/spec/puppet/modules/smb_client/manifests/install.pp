class smb_client::install {
  package { "$smb_client::smb_pkg":
    ensure  =>  installed,
  }

  if $smb_client::install_tools {
    package { "$smb_client::smb_tools_pkg":
      ensure  =>  installed,
    }
  }
}
