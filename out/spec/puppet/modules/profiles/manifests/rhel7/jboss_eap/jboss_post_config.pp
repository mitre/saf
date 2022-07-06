class profiles::rhel7::jboss_eap::jboss_post_config {
  validate_array($profiles::rhel7::jboss_eap::global_cli_configs)
  validate_array($profiles::rhel7::jboss_eap::ha_cli_configs)
  validate_array($profiles::rhel7::jboss_eap::full_cli_configs)

  $server_data = $profiles::rhel7::jboss_eap::jboss_eap_instances

  $server_list = keys($server_data)

  $jdk_parent = dirname($profiles::rhel7::jboss_eap::jdk_install_dir)
  $cacerts_file = "${jdk_parent}/java/${profiles::rhel7::jboss_eap::jdk_cacerts_file}"
  augeas { "Add SSL settings to: ${profiles::rhel7::jboss_eap::eap_install_dir}/bin/jboss-cli.xml":
    incl    => "${profiles::rhel7::jboss_eap::eap_install_dir}/bin/jboss-cli.xml",
    lens    => 'xml.lns',
    changes => [
               "set jboss-cli/#text[following-sibling::*[1][label()='ssl']] \"\n    \"",
               "set jboss-cli/ssl/#text[1] \"\n        \"",
               "set jboss-cli/ssl/trust-store/#text \"${cacerts_file}\"",
               "set jboss-cli/ssl/#text[2] \"        \"",
               "set jboss-cli/ssl/trust-store-password/#text \"${profiles::rhel7::jboss_eap::system_cacerts_password}\"",
               "set jboss-cli/ssl/#text[3] \"        \"",
               "set jboss-cli/ssl/modify-trust-store/#text \"false\"",
               "set jboss-cli/ssl/#text[4] \"    \"",
               ],
    require => Class['::jboss_eap::install'],
  } ->

  # Perform operations for each server instance
  profiles::rhel7::jboss_eap::server_instances { $server_list:
    server_data => $server_data
  }

  # Enable specified firewall ports
  $firewalld_ports_hash = array_to_hash($profiles::rhel7::jboss_eap::firewall_ports)
  create_resources('profiles::firewall_ports',$firewalld_ports_hash)
}

