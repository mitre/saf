# == Class: yum
#
# This module allows for the installation and removal of arbitrary sets
# of packages. It also allows for the configuration of yum via
# yum.conf. This module has DISA STIG considerations coded in.
#
# This module does not validate that options specified are valid or not.
#
# === Parameters
#
# [*yum_conf*]
#   This parameter specifies the location of the main yum configuration file.
#   It is used to configure the behavior of the utility not to add or remove
#   repositories. 
#
# [*custom_settings*]
#   This is a hash of <setting>=><value> pairs to add to yum.conf. All settings
#   are assumed to belong to the [main] section of the configuration file.
#
# [*install_pkgs*]
#   This is a list of packages to install (or ensure are installed).
#
# [*remove_pkgs*]
#   This is a list of packages to ensure are not installed. If packages are
#   listed in [remove_pkgs] and [install_pkgs] the [remove_pkgs] declaration
#   will take precedence and the package will be removed.
#
# === Variables
#
# None
#
# === Examples
#
#  class { 'yum':
#    install_pgks => ['python'],
#    stig_enabled => true,
#    custom_settings => {'installonly_limit'=>2},
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
class yum (
  $yum_conf                 = $yum::params::yum_conf,
  $custom_settings          = {},
  $install_pkgs             = [],
  $remove_pkgs              = [],
  $pkg_priority             = 'remove',
  $set_comments             = true,
) inherits yum::params {

  validate_array($install_pkgs)
  validate_array($remove_pkgs)
  validate_hash($custom_settings)
  validate_re($pkg_priority, ['remove','install'])

  contain yum::install
  contain yum::config
}
