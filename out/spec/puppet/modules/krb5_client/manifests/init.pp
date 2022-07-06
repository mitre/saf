# == Class: krb5_client
#
# This limited, purpose specific module configures only the basic, libdefaults
# for the Kerberos 5 libraries. I don't foresee a need to configure multiple
# Kerberos realms, etc. In the event we come to need more flexibility we will
# need to select or build another module. 
#
# This module also supports a special sssd configuration that is needed for 
# AD integration which makes this module to specific for general use.
#
# === Parameters
#
# [*allow_weak_crypto*]
#   krb5 setting of whether or not or not to allow weak crypto. Default: 'false'
#
# [*default_cache*]
#   krb5 location to store credential cache files. Default: 'FILE:/tmp/krb5cc_%{uid}'
#
# [*default_log*]
#   krb5 location for the default log. Default: 'file:/var/log/krb5.log'
#
# [*dns_lookup_kds*]
#   krb5 setting of whether to use DNS to lookup KDS. Default: 'true'
#
# [*dns_lookup_realm*]
#   krb5 setting of whether to use DNS to lookup kerberos realm. Default: 'true'
#
# [*forwardable*]
#   krb5 setting of whether or not to allow forwarding credentials. Default: 'true'
#
# [*include_sssd*]
#   Boolean specifying whether or not to include the sssd configuration. This is 
#   needed specifically for AD authentication of Red Hat Satellite UI. Default: 'false'
#
# [*krb5_config*]
#   The OS-specific location of the Kerbers configuration file.
#
# [*krb5_default_realm*]
#   krb5 setting for the default Kerberos realm. This value is required and there is no
#   default.
#
# [*renew_lifetime*]
#   krb5 setting for renew lifetime. Default: '1d'
#
# [*rdns*]
#   krb5 setting for whether to use reverse DNS lookups. Default: 'true'
#
# [*ticket_lifetime*]
#   krb5 setting for ticket lifetime. Default: '8h'
#
# === Variables
#
# None
#
# === Examples
#
#  class { 'krb5_client':
#    krb5_default_realm => "TEST.EXAMPLE.COM",
#    include_sssd => true,
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
class krb5_client (
  $krb5_default_realm,
  $krb5_config       = $krb5_client::params::krb5_config,
  $include_sssd      = false,
  $default_log       = $krb5_client::params::default_log,
  $default_cache     = $krb5_client::params::default_cache,
  $allow_weak_crypto = $krb5_client::params::allow_weak_crypto,
  $dns_lookup_realm  = $krb5_client::params::dns_lookup_realm,
  $dns_lookup_kds    = $krb5_client::params::dns_lookup_kds,
  $ticket_lifetime   = $krb5_client::params::ticket_lifetime,
  $renew_lifetime    = $krb5_client::params::renew_lifetime,
  $rdns              = $krb5_client::params::rdns,
  $forwardable       = $krb5_client::params::forwardable,
  $required_spns     = [],
) inherits krb5_client::params {

  validate_bool($include_sssd)

  contain krb5_client::install
  contain krb5_client::config

  krb5_client::spn { $required_spns: }

}
