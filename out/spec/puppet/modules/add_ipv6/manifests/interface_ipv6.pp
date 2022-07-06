define add_ipv6::interface_ipv6 (
  $ipv6_settings,
  $ipv6_addr,
  $set_comment   = true,
  $restart_if    = false,
) {
  include add_ipv6::params

  validate_hash($ipv6_settings)
  validate_bool($set_comment)
  validate_bool($restart_if)

  $if_name = $name
  $if_file = "${add_ipv6::params::ifcfg_base}${if_name}"
  $lens = $add_ipv6::params::lens

  $settings_hash = merge($ipv6_settings, { 'IPV6ADDR' => $ipv6_addr } )
  $settings_list = join_keys_to_values($settings_hash, '|')
  $unique_settings_list = suffix($settings_list, "|${name}")
  add_ipv6::do_simple_vars { $unique_settings_list:
    file => $if_file,
    lens => $lens,
  } 

  if $restart_if {
    Add_ipv6::Do_simple_vars <||> ~>
    exec { "Shut down interface ${if_name}":
      command     =>  "/usr/sbin/ifdown ${if_name}",
      refreshonly =>  true,
    } ~>
    exec { "Start interface ${if_name}":
      command     =>  "/usr/sbin/ifup ${if_name}",
      refreshonly =>  true,
    }
  }

  $last_setting = $unique_settings_list[size($unique_settings_list) - 1]
  $comment = 'IPV6 OPTIONS ARE BEING MANAGED BY PUPPET - DO NOT MODIFY!!'
  if $set_comment {
    augeas { "Set comment for IPv6 options in ${if_file}":
      incl    =>  $if_file,
      lens    =>  $lens,
      changes =>  [
                  "ins #comment before *[label()=~regexp('^IPV6.*')][1]",
                  "set #comment[following-sibling::*[1][label()=~regexp('^IPV6.*')]] \"${comment}\"",
                  ],
      onlyif  =>  "match #comment[.=\"${comment}\"] size == 0",
      require =>  Add_ipv6::Do_simple_vars[$last_setting],
      }
  } else {
    augeas { "Remove comment for IPv6 options in ${if_file}":
      incl    =>  $if_file,
      lens    =>  $lens,
      changes =>  "rm #comment[.=\"${comment}\"]",
    }
  }
}
