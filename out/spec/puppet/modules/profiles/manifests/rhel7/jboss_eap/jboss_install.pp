class profiles::rhel7::jboss_eap::jboss_install 
{
  $java_home_parent = dirname($profiles::rhel7::jboss_eap::jdk_install_dir)

  # Create installation directory up to the bottom level dir. This directory
  # will be created/managed by the base module.
  $eap_home_parent = dirname($profiles::rhel7::jboss_eap::eap_install_dir)
  profiles::build_dir { $eap_home_parent:
    systemdirs => $profiles::rhel7::jboss_eap::system_base_dirs,
    owner      => $profiles::rhel7::jboss_eap::eap_owner,
    group      => $profiles::rhel7::jboss_eap::eap_group,
    mode       => '0750',
  }

  class { '::jboss_eap':
    archive_stage_location    => $profiles::rhel7::jboss_eap::archive_stage_location,
    eap_owner                 => $profiles::rhel7::jboss_eap::eap_owner,
    eap_owner_id              => $profiles::rhel7::jboss_eap::eap_owner_id,
    eap_group                 => $profiles::rhel7::jboss_eap::eap_group,
    eap_group_id              => $profiles::rhel7::jboss_eap::eap_group_id,
    eap_extra_groups          => [$profiles::rhel7::jboss_eap::jdk_group],
    eap_filename              => $profiles::rhel7::jboss_eap::eap_filename,
    eap_install_dir           => $profiles::rhel7::jboss_eap::eap_install_dir,
    eap_checksum              => $profiles::rhel7::jboss_eap::eap_checksum,
    eap_checksum_type         => $profiles::rhel7::jboss_eap::eap_checksum_type,
    java_home                 => "${java_home_parent}/java",
    multiinstance             => $profiles::rhel7::jboss_eap::multiinstance,
    standalone_base           => $profiles::rhel7::jboss_eap::standalone_base,
    domain_base               => $profiles::rhel7::jboss_eap::domain_base,
    service_conf_link         => $profiles::rhel7::jboss_eap::service_conf_link,
    service_conf_filename     => $profiles::rhel7::jboss_eap::service_conf_filename,
    service_conf_local        => $profiles::rhel7::jboss_eap::service_conf_local,
  }
}
