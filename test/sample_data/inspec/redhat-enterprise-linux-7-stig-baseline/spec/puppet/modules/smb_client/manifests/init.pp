# == Class: smb_client
#
# This limited, purpose-specific module is used to configure only the 
# samba client global settings. It's primary intent is to provide the 
# packages and base configuration necessary to support Active Directory
# integration. There is limited flexibility and functionality beyond that.
# If further configurations are required, use a different samba module.
#
# === Parameters
#
# [*install_tools*]
#   Boolean specifying whether or not to install the samba tools package. This
#   package provides the 'net' utility which is used to join a system
#   to an active directory domain. Default: true
#
# [*krb5_realm*]
#   The Kerberos v5 realm which to use. This parameter is REQUIRED to be provided.
#
# [*smb_config*]
#   The OS-specific location of the smb.conf configuration file.
#
# [*smb_pkg*]
#   The OS-specific name of the package to install to provide the samba client
#   functionality.
#
# [*smb_tools_pkg*]
#   The OS-specific name of the package to install to provide the samba tools 
#   (net utility).
#
# [*workgroup*]
#   This is a REQUIRED input specifying the name of the Windows workgroup. As far
#   as I can tell it is not particularly meaningful in our use-case but is
#   required nonetheless.
#
# === Variables
#
# None
#
# === Examples
#
#  class { 'smb_client':
#    workgroup => "TEST",
#    krb5_realm => "TEST.EXAMPLE.COM",
#    install_tools => true,
#  }
#
# === Authors
#
# Author Lesley Kimmel <lesley.j.kimmel@gmail.com>
#
# === Copyright
#
# Copyright 2017 Lesley Kimmel, unless otherwise noted.
#
class smb_client (
  $workgroup,
  $krb5_realm,
  $smb_config    = $smb_client::params::smb_config,
  $smb_pkg       = $smb_client::params::smb_pkg,
  $install_tools = true,
  $smb_tools_pkg = $smb_client::params::smb_tools_pkg,
) inherits smb_client::params {
  validate_bool($install_tools)

  contain smb_client::install
  contain smb_client::config
}
