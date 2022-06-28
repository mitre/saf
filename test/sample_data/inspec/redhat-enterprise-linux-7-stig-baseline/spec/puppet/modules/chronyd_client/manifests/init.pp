# == Class: chronyd_client
#
# A limited module which allows for the [fairly] flexible configuration of the
# server as an NTP CLIENT using chrony. This module does not allow server-specific
# settings. The assumption is that hosts using this module will be using a remote
# NTP server and not providing any time services themselves. The module also
# includes DISA STIG mandated settings when enabled.
#
# === Parameters
#
# [*conf_file*]
#   The OS-specific location of the chrony configuration file.
#
# [*custom_settings*]
#   This is a hash of options with their value(s). Most values should be
#   provided as strings. For options that can appear more than once 
#   (eg. bindcmdaddress) provide each separate line as a member of a list.
#
#   For example the default configuration:
#     bindcmdaddress 127.0.0.1
#     bindcmdaddress ::1
#   would be supplied as:
#     'bindcmdaddress' => ['127.0.0.1','::1']
#
#   Some options are simply keywords that don't have a value attached to them.
#   For these options simply pass the boolean true (unquoted) for present and
#   the boolean false (unquoted) for absent. 
#
#   The 'commandkey' option is used by the module logic which expects its 
#   value to be an integer instead of a string.
#
# [*enabled*]
#   Boolean specifying whether the chrony service is running or not. True means
#   the service should be started. False means the service should be stopped.
#   Default: true
#
# [*ensure*]
#   Boolean specifying whether the chrony package should be installed. True means
#   the package should be installed. False means the package should be removed.
#   Default: true
#
# [*keys*]
#   This is a hash mapping the chrony key strings to their integer identifier. It
#   is used to generate the chrony key file.
#   For example:
#      { 1 => 'MD5 ThisIsAPassword',
#        2 => 'SHA1 HEX:<hex_string>' }
#
# [*pkg_name*]
#   The OS-specific name for the chrony package.
#
# [*servers*]
#   This is a required parameter providing the servers to be used for synchronization.
#   The value can be either a list of hostnames/IPs, if default options are acceptable,
#   or a hash mapping the hostname/IP with <option>=><value> pairs to be applied to
#   each host. If one server has specific options to be provided but the other does not
#   a hash still has to be provided. The uncustomized server can map an empty property hash.
#   For example:
#     [ 'server1','server2']
#     { 'server1' => { 'prefer' => false },
#       'server2' => {} }
#
# [*stig_enabled*]
#   Boolean specifying whether to enable STIG-mandated configurations. Default: true
#
# [*svc_name*]
#   The OS-specific name of the chrony service.
#
# [*use_defaults*]
#   Boolean specifying whether or not to use the default settings for a given OS.
#   Default: true
#
# === Variables
#
# None
#
# === Examples
#
#  class { 'chronyd_client':
#    servers => {
#               'server1' => { 'iburst' => false, 'key' => 2 },
#               'server2' => { 'key' => 2 },
#               },
#    stig_enabled => true,
#    keys    => {
#               1 => 'MD5 ThisIsAPassword',
#               2 => 'SHA1 HEX:<hex_string>'
#               },
#    custom_settings => { 'commandkey' => 1 },
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
class chronyd_client (
  $servers,
  $ensure             = true,
  $enabled            = true,
  $use_defaults       = true,
  $conf_file          = $chronyd_client::params::conf_file,
  $pkg_name           = $chronyd_client::params::pkg_name,
  $svc_name           = $chronyd_client::params::svc_name,
  $custom_settings    = {},
  $server_extra_opts  = {},
  $keys               = {},
) inherits chronyd_client::params {

  validate_bool($ensure)  
  validate_bool($enabled)  
  validate_bool($use_defaults)  
  validate_hash($custom_settings)
  validate_hash($servers)
  validate_hash($server_extra_opts)
  validate_hash($keys)

  contain chronyd_client::install
  contain chronyd_client::config
  contain chronyd_client::service

}
