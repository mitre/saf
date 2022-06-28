class add_ipv6::config {
  $addr_list = split($::ipv6_addrs,',')
  do_interfaces{ $addr_list: }
}

define do_interfaces {
  $if_info = split($name,'\|')
  $if_name = $if_info[0]
  $if_addr = $if_info[1]

  if size($add_ipv6::ipv6_settings) > 0 {
    $pass_settings = $add_ipv6::ipv6_settings
  } elsif $if_name == $::primary_interface {
    $pass_settings = merge($add_ipv6::ipv6_base_settings,
                     $add_ipv6::ipv6_primary_settings,
                     { 'IPV6_DEFAULTGW' => $add_ipv6::default_gateway })
  } else {
    $pass_settings = $add_ipv6::ipv6_base_settings
  }

  add_ipv6::interface_ipv6 { $if_name:
    ipv6_addr     => $if_addr,
    ipv6_settings => $pass_settings,
    set_comment   => $add_ipv6::set_comments,
    restart_if    => $add_ipv6::restart_if,
  }
}
