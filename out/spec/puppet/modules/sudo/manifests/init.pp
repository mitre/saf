# == Class: sudo
#
# This module allows for the addition of sudo configuration via drop-in
# files under the sudoers.d directory. It also manages the directory and
# all files in it. The base sudoers file is not edited directly other than
# to configure it per STIG when enabled.
#
# === Parameters
#
# [*custom_settings*]
#   Hash of hashes mapping a sudoers.d filename to an array of strings which
#   are the sudo rules and/or defaults to create. The array MUST be called
#   'lines'. See the 'Examples' section below for an example.
#      
# [*file_defaults*]
#   Default file settings defined in sudo::params class. The defaults must be
#   static values that are not dependent upon dynmic data determined elsewhere.
#   This is primarily used for file attributes like group, owner and mode.
#
# [*exclude_sudoers*]
#   This boolean is only relevant when 'stig_enabled' is 'true'. If this value
#   is true STIG settings will NOT be applied to base sudoers file. If this value
#   is false (default) STIG settings WILL be applied to the sudoers file.
#
# [*lsb_pkg*]
#   The custom fact provided with this module utilizes the 'lsb_release' binary
#   which is provided by this package. If it is not initially installed this 
#   module will install it for proper operation.
#
# [*purge_exclude*]
#   This is an array of filenames which to exclude from being purged from the
#   sudoers.d directory when 'purge_sudoersd => true'. This is useful for 
#   maintaining files that were configured outside of Puppet and are required
#   for the operation of other applications.
#
# [*purge_sudoersd*]
#   This boolean controls whether the sudoers.d directory is purged of files
#   that are not either managed by this module or excluded from purging by the
#   'purge_exclude' list. Setting this to true will delete files; false will
#   retain. Purging the file helps protect against unauthorized creation of
#   rules locally on servers.
#
# [*stig_enabled*]
#   This boolean controls whether or not to apply STIG settings. 
#
# [*stig_exclude*]
#   Some sudoers.d files have legitimate reasons to have configurations that
#   are not compliant with STIG. In these cases we can exclude them from 
#   modification by adding them to this array. Only the base filename need
#   be added to the array as the sudoers.d directory will be appended later.
#
# [*sudo_pkg*]
#   The OS-specific name for the sudo package. The package will be installed
#   if it is not already.
#
# [*sudoers_file*]
#   The full path to the base sudoers file. This value defaults to an OS-specific
#   value if not overridden.
#
# [*sudoersd_dir*]
#   The path containing sudoers.d fragment files. This will default to an 
#   OS-specific value if not overridden.
#
# [*validate_cmd*]
#   This is a command to validate the format of the sudoers file fragment before
#   saving it to disk. Invalid files will not be created if this command returns
#   a non-zero value.
#
# === Variables
#
# None
#
# === Custom Facts
#
# === Examples
#
#  class { "sudo":
#    custom_settings => {
#      'enterprise'  => {
#        'lines'  => [
#          '%unix-admins ALL = (root) PASSWD : ALL',
#        ],
#      },
#    },
#    purge_exclude  =>  ['file1'],
#    stig_exclude  =>  ['file1'],
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
class sudo (
  $sudo_pkg         = $sudo::params::sudo_pkg,
  $sudoers_file     = $sudo::params::sudoers_file,
  $sudoersd_dir     = $sudo::params::sudoersd_dir,
  $validate_cmd     = $sudo::params::validate_cmd,
  $lsb_pkg          = $sudo::params::lsb_pkg,
  $stig_enabled     = true,
  $custom_settings  = {},
  $purge_exclude    = [],
  $stig_exclude     = [],
  $exclude_sudoers  = false,
  $purge_sudoersd   = true,
  $file_defaults    = $sudo::params::file_defaults,
) inherits sudo::params {
  validate_bool($stig_enabled)
  validate_bool($exclude_sudoers)
  validate_hash($custom_settings)
  validate_hash($file_defaults)
  validate_array($stig_exclude)
  validate_array($purge_exclude)

  contain sudo::install
  contain sudo::config

  # Ensure explicit ordering here because there are several
  # resources defined in sudo::config that cannot be ordered
  # but that depend on a package installed in sudo::install
  Class['sudo::install'] -> Class['sudo::config']
}
