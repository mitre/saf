# It is possible to use this type using an array
# of strings mixed with hash values. To do so
# you must pass the array to custom function
# array_to_hash first.
define profiles::firewall_ports (
  $ensure = 'present',
  $zone   = undef,
) {
  validate_re($ensure, ['^present$','^absent$'])

  $comps = split($name,'/')

  $port = $comps[0]
  $proto = $comps[1]

  $zone_text = $zone ? {
    undef   => '<default>',
    default => $zone,
  }

  # We have to include firewalld to ensure that the port resources
  # are 'collected' and trigger a reload of IPTables.
  include firewalld

  firewalld_port { "Configuring port ${port}/${proto} in zone ${zone_text}":
    ensure   => $ensure,
    zone     => $zone,
    port     => $port,
    protocol => $proto,
  } 
}
