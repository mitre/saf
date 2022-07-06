define profiles::rhel7::jboss_eap::server_instances (
  $server_data,
) {
  $this_server = $server_data[$name]
  $modified_server = delete($this_server, ['base_cli_configs','full_cli_configs','ha_cli_configs'])
  $new_hash = {"${name}" => $modified_server}
  create_resources('::jboss_eap::server_instance', $new_hash)

  # Bring in ("collect") any deployments if they exist
  if $profiles::rhel7::jboss_eap::deployment_location {
    $standalone_deploy_path = "${profiles::rhel7::jboss_eap::standalone_base}/${name}/deployments"
    $domain_deploy_path = "${profiles::rhel7::jboss_eap::domain_base}/${name}/deployments"
    File <| title == $standalone_deploy_path or title == $domain_deploy_path |> {
      source  => $profiles::rhel7::jboss_eap::deployment_location,
      recurse => true,
    }
  }

  # Check whether we have a management port
  if has_key($this_server['properties'], 'jboss.management.native.port') {
    $mgmt_port = $this_server['properties']['jboss.management.native.port'] + 0
  } elsif has_key($this_server['properties'], 'jboss.socket.binding.port-offset') {
    $mgmt_port = $profiles::rhel7::jboss_eap::base_mgmt_port + $this_server['properties']['jboss.socket.binding.port-offset']
  } elsif $name == 'default' {
    $mgmt_port = $profiles::rhel7::jboss_eap::base_mgmt_port
  } else {
    fail('Initial configuration for an instance must specify either jboss.management.native.port or jboss.socket.binding.port-offset as a Java property.')
  }

  if has_key($this_server, 'base_cli_configs') {
    $base_changes = concat($profiles::rhel7::jboss_eap::global_cli_configs, $this_server['base_cli_configs'])
  } else {
    $base_changes = $profiles::rhel7::jboss_eap::global_cli_configs
  }

  if has_key($this_server, 'ha_cli_configs') {
    $ha_changes = concat($profiles::rhel7::jboss_eap::ha_cli_configs, $this_server['ha_cli_configs'])
  } else {
    $ha_changes = $profiles::rhel7::jboss_eap::ha_cli_configs
  }

  if has_key($this_server, 'full_cli_configs') {
    $full_changes = concat($profiles::rhel7::jboss_eap::full_cli_configs, $this_server['full_cli_configs'])
  } else {
    $full_changes = $profiles::rhel7::jboss_eap::full_cli_configs
  }

  # Combine all relevant configuration rules based on the server's specified
  # configuration filename
  $combined_changes = $this_server['standalone_config'] ? {
    /.*-full-ha.*/ => concat($base_changes, $ha_changes, $full_changes),
    /.*-ha.*/      => concat($base_changes, $ha_changes),
    /.*-full.*/    => concat($base_changes, $full_changes),
    default        => $base_changes,
  }

  # If the server has its own specific CLI rules, add them to the list
  if has_key($server_data[$name], 'cli_configs') {
    $all_changes = concat($combined_changes, $server_data[$name]['cli_configs'])
  } else {
    $all_changes = $combined_changes
  }

  # Set up the connection information
  # Default the management IP to 'localhost4' because the jboss-cli connection
  # seems to prefer IPv6 when resolving 'localhost' in /etc/hosts. This forces
  # an IPv4 lookup when IPv4 is in use.
  $mgmt_ip = dig44($modified_server,['properties','jboss.bind.address.management'], 'localhost4')
  jboss_admin::server { $name:
    management_port       => "${mgmt_port}",
    management_ip         => $mgmt_ip,
    manage_server_restart => true,
    base_path             => $profiles::rhel7::jboss_eap::eap_install_dir,
    require               => Service["eap-${name}-${this_server['mode']}"],
  }

  # Execute the commands as a batch
  jboss_batch { "Combined configuration for instance: ${name}":
    batch     => $all_changes,
    server    => $name,
    logoutput => true,
    unless    => $profiles::rhel7::jboss_eap::cli_validation_cmd,
  } ~>

  # Trigger server to restart. This is needed because jboss_admin does
  # not appear to trigger its cleanup (restart) actions off of batches;
  # only execs. So we execute a noop command to trigger restart.
  jboss_exec { "Trigger instance restart: ${name}":
    command     => ':server-set-restart-required',
    server      => $name,
    refreshonly => true,
  }
}
