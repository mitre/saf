define profiles::rhel7::oracle_db::add_member_exceptions (
  $zone,
  $ipmap,
) {
  $ip = $ipmap[$name]
  firewalld_rich_rule { "Accept all connections from cluster member: ${name}(${ip})":
    ensure => present,
    zone   => $zone,
    source => $ip,
    action => 'accept',
  }
}
