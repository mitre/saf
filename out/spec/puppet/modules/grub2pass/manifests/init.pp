# == Class: grub2pass
#
# This module allows the configuration of a grub superuser and password only.
# Configuration of grub is a sensitive operation and should be considered 
# carefully on a case by case basis. This module is only intended to meet 
# the STIG requirement for securing GRUB2.
#
# === Parameters
#
# [*grub_cfg*]
#   Fully qualified path to the primary grub2 configuation file. 
#
# [*grub_pass*]
#   This is the pbkdf2-encrypted password for the GRUB2 superuser.
#
# [*grub_user*]
#   This is the name of the GRUB2 superuser account.
#
# [*grubd_file*]
#   This is the fully qualified path to the grub.d configuration file in
#   which to store the superuser information.
#
# [*mk_grub_cmd*]
#   The full command to use to [re]generate the primary GRUB2 configuration.
#
# === Variables
#
# None
#
# === Examples
#
#  class { 'grub2pass':
#    servers => [ 'pool.ntp.org', 'ntp.local.company.com' ],
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
class grub2pass (
  $grub_pass,
  $grub_user    = $grub2pass::params::grub_user,
  $grub_cfg     = $grub2pass::params::grub_cfg,
  $mk_grub_cmd  = $grub2pass::params::mk_grub_cmd,
  $grubd_file   = $grub2pass::params::grubd_file,
) inherits grub2pass::params {
  validate_re($grub_pass, '^grub\.pbkdf2\.sha512\..*$',"Password does not appear to be encrypted appropriately. Use ${grub2pass::params::grub_passwd_cmd} to generate password hash.")

  contain grub2pass::config
}
