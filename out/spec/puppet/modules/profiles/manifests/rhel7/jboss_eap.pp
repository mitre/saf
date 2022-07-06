class profiles::rhel7::jboss_eap (
  $archive_stage_location,
  $eap_owner,
  $eap_owner_id,
  $eap_owner_shell           = '/sbin/nologin',
  $eap_group,
  $eap_group_id,
  $system_base_dirs          = ['/'],
  $eap_filename,
  $eap_install_dir,
  $eap_checksum              = undef,
  $eap_checksum_type         = 'none',
  $jdk_type                  = 'oracle',
  $jdk_owner                 = undef,
  $jdk_owner_id              = undef,
  $jdk_owner_shell           = '/sbin/nologin',
  $jdk_group                 = undef,
  $jdk_group_id              = undef,
  $jdk_filename,
  $jdk_install_dir,
  $jdk_checksum              = undef,
  $jdk_checksum_type         = 'none',
  $jdk_removes               = [],
  $jdk_cacerts_file          = 'jre/lib/security/cacerts',
  $system_cacerts            = '/etc/pki/java/cacerts',
  $system_cacerts_password   = 'changeit',
  $jdk_security_settings     = {},
  $base_mgmt_port            = 9999,
  $multiinstance             = false,
  $standalone_base           = undef,
  $domain_base               = undef,
  $service_conf_link         = '/etc/jboss-as/jboss-as.conf',
  # Service conf file located under $JBOSS_HOME/bin/init.d
  $service_conf_filename,
  $service_conf_local,
  $jboss_eap_instances       = hiera('jboss_eap::instances'),
  $identity_dir              = '/opt/identity',
  $deploy_vault              = false,
  $vault_location            = 'puppet:///jboss/vault',
  $deployment_location       = undef,
  $identity_cert             = undef,
  $identity_private          = undef,
  $keystore_type             = 'pkcs12',
  $keystore_password         = undef,
  $keystore_name             = 'identity.jks',
  $global_cli_configs        = [],
  $ha_cli_configs            = [],
  $full_cli_configs          = [],
  $cli_validation_cmd        = undef,
  $firewall_ports            = []
) {
  include profiles

  # Currently only allow the base directory to be one level deep
  validate_bool($multiinstance)
  validate_bool($deploy_vault)
  validate_hash($jdk_security_settings)
  validate_array($jdk_removes)
  validate_hash($jboss_eap_instances)
  validate_array($firewall_ports)

  contain profiles::rhel7::jboss_eap::java_install
  contain profiles::rhel7::jboss_eap::java_security
  contain profiles::rhel7::jboss_eap::jboss_install
  contain profiles::rhel7::jboss_eap::jboss_identity
  contain profiles::rhel7::jboss_eap::jboss_post_config

  Class['profiles::rhel7::jboss_eap::java_install'] ->
  Class['profiles::rhel7::jboss_eap::java_security'] ->
  Class['profiles::rhel7::jboss_eap::jboss_identity'] ->
  # Ensure that the identity stores are in place before any
  # instances are created and configured.
  Profiles::Rhel7::Jboss_eap::Server_instances <| |>
}
