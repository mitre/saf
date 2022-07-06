# = foreman_* providers support
#
# Installs dependencies to use the foreman_* types and providers.
#
# Default parameters should point to the latest packages required for
# the current version of the providers.
#
# === Parameters:
#
# $oauth::                    Install oauth dependency
#                             type:boolean
#
# $oauth_package::            Name of oauth package
#
# $json::                     Install json dependency, not required on Ruby 1.9 or higher
#                             type:boolean
#
# $json_package::             Name of json package
#
# $apipie_bindings::          Install apipie-bindings dependency
#                             type:boolean
#
# $apipie_bindings_package::  Name of apipie-bindings package
#
class foreman::providers(
  $oauth                   = $::foreman::providers::params::oauth,
  $oauth_package           = $::foreman::providers::params::oauth_package,
  $json                    = $::foreman::providers::params::json,
  $json_package            = $::foreman::providers::params::json_package,
  $apipie_bindings         = $::foreman::providers::params::apipie_bindings,
  $apipie_bindings_package = $::foreman::providers::params::apipie_bindings_package,
) inherits foreman::providers::params {
  validate_bool($oauth, $json, $apipie_bindings)
  validate_string($oauth_package, $json_package, $apipie_bindings_package)

  if $oauth {
    ensure_packages([$oauth_package])
  }

  if $json {
    ensure_packages([$json_package])
  }

  if $apipie_bindings {
    ensure_packages([$apipie_bindings_package])
  }
}
