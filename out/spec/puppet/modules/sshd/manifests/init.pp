# == Class: sshd
#
# This class is used to install and configure sshd. It will also install
# the ssh client package if requested. The client package is not configured.
#
# === Authors
#
# Lesley J Kimmel <lesley.j.kimmel@gmail.com>
#
class sshd (
  $custom_settings  = {},
  $sshd_config      = $sshd::params::sshd_config,
  $svc_name         = $sshd::params::svc_name,
  $sshd_pkg_name    = $sshd::params::sshd_pkg_name,
  $set_comments	    = true,
  $priv_key_mode    = $sshd::params::priv_key_mode,
  $pub_key_mode     = $sshd::params::pub_key_mode,
  $lens             = $sshd::params::lens,
) inherits sshd::params {

  validate_hash($custom_settings)

  contain sshd::install
  contain sshd::config
  contain sshd::service

  # Force all 'sshd_settings' defined types to occur AFTER the sshd_config
  # file exists and to cause a refresh of the sshd service.
  File["${sshd_config}"] ->
  Sshd::Sshd_settings <||> ~>
  Service["${svc_name}"]
}
