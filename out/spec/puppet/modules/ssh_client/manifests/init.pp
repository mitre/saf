# == Class: ssh_client
#
# This class is used to install and configure ssh_client. It will also install
# the ssh client package if requested. The client package is not configured.
#
# === Parameters
#
# [*stig_enabled*]
#   This parameter controls whether default values dictated by DISA STIG
#   are utilized and take precedence over any user-provided values. Valid
#   values are true (boolean) or false (boolean).
#
# [*custom_settings*]
#   This value is a hash map that allows users to supply customized parameters
#   to ssh_client_config. This hash assumes that all parameters are simple
#   'key = value' pairs. However, these values ultimately feed an augeas
#   resource. The augeas lens for ssh_client does not always use simple key/value
#   pairs. Therefore, the user needs to be aware of how the augeas lens views
#   the parameter being set. The 'key' can be a path starting with the base
#   of the tree. For example, the 'MACs' parameter while appearing to be a 
#   simple string of comma-separated values in the configuration file is 
#   viewed by augeas as a tree of values, each being numbered so that the
#   first value is 'MACs/1' and the next value is 'MACs/2', and so on. So 
#   instead of a MACs value with (2) values being provided as:
#   'MACs': '<value1>,<value2>'
#   It would actually be requested as two separate values:
#   'MACs/1': '<value1>'
#   'MACs/2': '<value2>'
#
# [*ssh_client_config*]
#   This value is used to point to the configuration file for ssh_client. It is
#   useful to override this value to test configuration changes without
#   affecting the actual system configuration. This value should be the full
#   path to the desired configuration file.
#
# [*ssh_pkg_name*]
#   This is the name of the ssh client package on this operating system.
#
# === Variables
#
# [*stig_settings*]
#   This variable is set from the params file/class but is not made
#   available as a parameter so that it cannot be easily overridden.
#
# === Examples
#
#  class { 'ssh_client':
#    stig_enabled     => true,
#    custom_settings => {
#                       'ChallengeResponseAuthentication => 'yes',
#                       'GSSAPIAuthentication            => 'yes',
#                       'GSSAPICleanupCredentials        => 'yes',
#                       },
#  }
#
# === Authors
#
# Lesley J Kimmel <lesley.j.kimmel@gmail.com>
#
class ssh_client (
  $host_settings     = {},
  $ssh_client_config = $ssh_client::params::ssh_client_config,
  $ssh_pkg_name      = $ssh_client::params::ssh_pkg_name,
  $set_comments      = true
) inherits ssh_client::params {

  validate_hash($host_settings)

  contain ssh_client::install
  contain ssh_client::config
}
