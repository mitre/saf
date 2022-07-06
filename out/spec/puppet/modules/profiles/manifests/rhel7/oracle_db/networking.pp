class profiles::rhel7::oracle_db::networking {
  include firewalld

  if ! $::oracle_public_interface { fail('Installation requires a public interface, none found!') }
  if ! $::oracle_private_interface { fail('Installation requires a private interface, none found!') }

  # Configure public settings
  $pub_net_settings = join_keys_to_values($profiles::rhel7::oracle_db::pub_net_settings,':')

  # Only use the firewalld resource type if we're not controlled by NM.
  # Otherwise it will execute every time.
  if $::oracle_pub_nm_controlled == 'false' {
    firewalld_zone { $profiles::rhel7::oracle_db::public_zone:
      ensure     => present,
      interfaces => [$::oracle_public_interface]
    }
  }

  # Initialize public interface restart command(s)
  profiles::restart_interface { "Reload ${::oracle_public_interface} for Oracle RAC settings":
    if_name       => $::oracle_public_interface,
    nm_controlled => $::oracle_pub_nm_controlled,
    if_file       => $::oracle_pub_int_file,
  }

  # Suffix the settings with the interface name to ensure a unique resource
  $pub_net_settings_unique = suffix($pub_net_settings, ":${::oracle_public_interface}")
  profiles::do_simple_vars { $pub_net_settings_unique:
    file   => $::oracle_pub_int_file,
    lens   => $profiles::rhel7::oracle_db::ifcfg_lens,
  }
  ~> Exec <| title == "Restart interface ${::oracle_public_interface}" |>
  -> Service['firewalld']

  # Configure private settings (and ASM, if applicable)
  $priv_net_settings = join_keys_to_values($profiles::rhel7::oracle_db::priv_net_settings,':')

  # Suffix the settings with the interface name to ensure a unique resource
  $priv_net_settings_unique = suffix($priv_net_settings, ":${::oracle_private_interface}")
  $asm_net_settings_unique = suffix($priv_net_settings, ":${::oracle_asm_interface}")

  # If we have separate private and ASM interfaces add them both
  # to the private zone.
  if ! $profiles::rhel7::oracle_db::asm_priv_combined { 
    if ! $::oracle_asm_interface { fail('A dedicated interface for ASM is required but none found!') }

    # Add ASM interface to firewall list if not NM controlled
    if $::oracle_asm_nm_controlled == 'false' {
      $asm_non_nm_interface = [$::oracle_asm_interface]
    } else {
      $asm_non_nm_interface = []
    }

    # Initialize ASM interface restart command(s)
    profiles::restart_interface { "Reload ${::oracle_asm_interface} for Oracle RAC settings":
      if_name       => $::oracle_asm_interface,
      nm_controlled => $::oracle_asm_nm_controlled,
      if_file       => $::oracle_asm_int_file,
    }

    # Configure the ASM interface
    profiles::do_simple_vars { $asm_net_settings_unique:
      file   => $::oracle_asm_int_file,
      lens   => $profiles::rhel7::oracle_db::ifcfg_lens,
    }
    ~> Exec <| title == "Restart interface ${::oracle_asm_interface}" |>
    -> Service['firewalld']
  } else {
    $asm_non_nm_interface = []
  }
    
  # Add private interface to firewall list if not NM controlled
  if $::oracle_priv_nm_controlled == 'false' {
    $priv_non_nm_interface = [$::oracle_private_interface]
  } else {
    $priv_non_nm_interface = []
  }

  $non_nm_interfaces = concat($asm_non_nm_interface, $priv_non_nm_interface)

  # Only use the firewalld resource type if we're not controlled by NM.
  # Otherwise it will execute every time.
  if size($non_nm_interfaces) > 0 {
    firewalld_zone { $profiles::rhel7::oracle_db::private_zone:
      ensure     => present,
      interfaces => $non_nm_interfaces
    }
  }

  # Initialize private interface restart command(s)
  profiles::restart_interface { "Reload ${::oracle_private_interface} for Oracle RAC settings":
    if_name       => $::oracle_private_interface,
    nm_controlled => $::oracle_priv_nm_controlled,
    if_file       => $::oracle_priv_int_file,
  }

  # Configure the private interface
  profiles::do_simple_vars { $priv_net_settings_unique:
    file   => $::oracle_priv_int_file,
    lens   => $profiles::rhel7::oracle_db::ifcfg_lens,
  }
  ~> Exec <| title == "Restart interface ${::oracle_private_interface}" |>
  -> Service['firewalld']

  # Create services
  create_resources('profiles::firewall_service', $profiles::rhel7::oracle_db::firewall_services)

  # Modify /etc/hosts
  concat { '/etc/hosts':
    ensure => present,
    owner  => 'root',
    group  => 'root',
    mode   => '0644',
  }

  concat::fragment { '/etc/hosts header':
    target  => '/etc/hosts',
    content => template('profiles/oracle_db/_hosts_header.erb'),
    order   => 01,
  }

  $primary_host_entries = parsejson($::primary_host_entries)
  $vip_host_entries = parsejson($::vip_host_entries)
  $pvt_host_entries = parsejson($::pvt_host_entries)
  $asm_host_entries = parsejson($::asm_host_entries)
  $scan_host_entries = sort(parsejson($::scan_host_entries))
  $host_entries = { 'Host Entries for RAC Nodes' => $primary_host_entries,
                    'VIP Addresses'              => $vip_host_entries,
                    'Private Addresses'          => $pvt_host_entries,
                    'ASM Addresses'              => $asm_host_entries,
                    'SCAN Addresses'             => $scan_host_entries,
                  }
  
  concat::fragment { '/etc/hosts lines':
    target  => '/etc/hosts',
    content => template('profiles/oracle_db/_hosts_fragment.erb'),
    order   => 10,
  }

  # Allow all connections from cluster members
  if $profiles::rhel7::oracle_db::trust_members {
    $cluster_ips = parsejson($::cluster_ips)
    profiles::rhel7::oracle_db::add_member_exceptions { $profiles::rhel7::oracle_db::cluster_members:
      zone  => $profiles::rhel7::oracle_db::public_zone,
      ipmap => $cluster_ips,
    }
  }
}
