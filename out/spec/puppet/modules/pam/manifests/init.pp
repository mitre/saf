# == Class: pam
#
# This module deploys a fairly site-specific PAM configuration for system-auth
# and password-auth. This module does not provide the flexibility of many other 
# modules available on the Puppet Forge. However, I don't foresee the need to have
# very tailored PAM configurations. Furthermore, many of the modules available 
# require the admin to explicitly define all of the lines required in the file. I
# would rather provide a limited set of options to tailor the configuration to 
# a limited set of states. If other configurations are necessary we can update
# this module (templates) to account for them.
#
# The included templates assume that we use pam_pwquality for password complexity
# enforcement. Because of this we also provide the ability to configure the
# pwquality.conf configuration file.
#
# === Parameters
#
# [*oddjob_pkg*]
#   The OS-specific name of the oddjob/mkhomedir package. Our configuration
#   assumes the use of this service.
#
# [*oddjob_svc*]
#   The OS-specific name of the oddjob service. 
#
# [*pam_dir*]
#   The OS-specific location of the system PAM configuration.
#
# [*pam_local_config*]
#   The name/location of the primary PAM configuration file for local/console access.
#   (e.g. system-auth)
#
# [*pam_local_link*]
#   In order to avoid our configuration getting overwritten by authconfig we utilize
#   customized PAM configuration files (e.g. system-auth-local) and configure the 
#   system-auth softlink to point to it.
#
# [*pam_remote_config*]
#   The name/location of the primary PAM configuration file for remote access.
#   (e.g. password-auth)
#
# [*pam_remote_link*]
#   In order to avoid our configuration getting overwritten by authconfig we utilize
#   customized PAM configuration files (e.g. password-auth-local) and configure the 
#   password-auth softlink to point to it.
#
# [*pwquality_conf_file*]
#   The OS-specific location of the pam_pwquality configuration file.
#
# [*pwquality_custom_settings*]
#   Hash providing the <setting>=><value> pairs to add to the pwquality configuration.
#
# [*pwquality_pkg*]
#   The OS-specific name for the package providing the pam_pwquality module.
#
# [*sssd_enabled*]
#   Boolean specifying whether or not to configure PAM to utilize sssd for authentication.
#
# [*sssd_pkg*]
#   The OS-specific name for the sssd package.
#
# [*stig_enabled*]
#   Boolean specifying whether or not to enable DISA STIG configurations
#
# === Variables
#
# None
#
# === Examples
#
#  class { 'pam':
#    stig_enabled => true,
#    sssd_enabled => true,
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
class pam (
  $system_auth_lines          = $pam::params::default_auth_lines,
  $password_auth_lines        = $pam::params::default_auth_lines,
  $sssd_enabled               = false,
  $pam_dir                    = $pam::params::pam_dir,
  $oddjob_pkg                 = $pam::params::oddjob_pkg,
  $oddjob_svc                 = $pam::params::oddjob_svc,
  $sssd_pkg                   = $pam::params::sssd_pkg,
  $pwquality_pkg              = $pam::params::pwquality_pkg,
  $pwquality_conf_file        = $pam::params::pwquality_conf_file,
  $pwquality_custom_settings  = {},
  $pam_remote_config          = $pam::params::pam_remote_config,
  $pam_local_config           = $pam::params::pam_local_config,
  $pam_remote_link            = $pam::params::pam_remote_link,
  $pam_local_link             = $pam::params::pam_local_link,
  $limits_conf_file           = $pam::params::limits_conf_file,
  $limits_confd_dir           = $pam::params::limits_confd_dir,
  $limits_purge_confd         = true,
  $limits_purge_exclude       = $pam::params::limits_purge_exclude,
  $limits_file_mode           = $pam::params::limits_file_mode,
  $set_comments               = true,
) inherits pam::params {
  validate_bool($sssd_enabled)
  validate_bool($limits_purge_confd)
  validate_hash($pwquality_custom_settings)
  validate_array($system_auth_lines)
  validate_array($password_auth_lines)

  contain pam::install
  contain pam::config
  contain pam::service
}
