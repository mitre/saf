define profiles::restart_interface (
  $nm_controlled,
  $if_name,
  $if_file,
) {
  include profiles

  if ! defined(Exec["Restart interface ${if_name}"]) {
    if $profiles::restart_networking {
      if $nm_controlled == 'true' {
        exec { "Restart interface ${if_name}":
          # For NM we have to reload the config from file and then apply config to device
          command     => "/bin/nmcli con load ${if_file} && /bin/nmcli dev re ${if_name}",
          refreshonly => true,
        }
      } else {
        exec { "Restart interface ${if_name}":
          command     => "/usr/sbin/ifdown ${if_name} && /usr/sbin/ifup ${if_name}",
          refreshonly => true,
        }
      }
    } else {
      # if restart_networking == false, define an action to do nothing
      exec { "Restart interface ${if_name}":
        command     => '/usr/bin/true',
        refreshonly => true,
      }
    }
  }
}
