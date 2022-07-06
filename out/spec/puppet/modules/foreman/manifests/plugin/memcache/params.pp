# Default parameters for foreman::plugin::memcache
class foreman::plugin::memcache::params {

  $hosts                = []
  $namespace            = 'foreman'
  $expires_in           = 86400
  $compress             = true
}
