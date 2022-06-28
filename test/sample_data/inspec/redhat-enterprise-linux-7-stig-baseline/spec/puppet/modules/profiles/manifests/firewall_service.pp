define profiles::firewall_service (
  $source_address = undef,
  $ports          = undef,
  $short_desc     = undef,
  $descr          = undef,
  $destination    = undef,
  $ensure         = 'present',
  $zone           = undef,
  $module         = undef,
  $config_dir     = undef,
) {
  $full_desc = $descr ? {
    undef   => $short_desc,
    default => $descr
  }

  # Reformat ports for use with firewalld::custom_service
  if $ports == undef {
    $portx == undef
  } else {
    validate_array($ports)
    $portx = format_ports($ports)
  }

  # Create new custom service
  firewalld::custom_service { $short_desc:
    ensure      => $ensure,
    short       => $short_desc,
    port        => $portx,
    description => $full_desc,
    module      => $module,
    destination => $destination,
    filename    => $name,
    config_dir  => $config_dir,
  }
  
  if $source_address {
    validate_ip_address($source_address)
    $ip_family = $source_address ? {
      /.*:.*/  => 'ipv6',
      default  => 'ipv4',
    }

    firewalld_rich_rule { "Required ports for ${short_desc}":
      ensure  => $ensure,
      service => $name,
      zone    => $zone,
      source  => $source_address,
      action  => 'accept',
      family  => $ip_family,
      require => Firewalld::Custom_service[$short_desc],
    }
  } else {
    firewalld_service { "Required ports for ${short_desc}":
      ensure  => $ensure,
      service => $name,
      zone    => $zone,
      require => Firewalld::Custom_service[$short_desc],
    }
  }
}
