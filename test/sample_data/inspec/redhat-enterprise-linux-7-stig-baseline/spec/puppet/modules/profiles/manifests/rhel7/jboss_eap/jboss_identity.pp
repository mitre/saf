class profiles::rhel7::jboss_eap::jboss_identity {
  File {
    owner      => $profiles::rhel7::jboss_eap::eap_owner,
    group      => $profiles::rhel7::jboss_eap::eap_group,
    mode       => '0640',
  }

  # Create identity directory structure
  profiles::build_dir { $profiles::rhel7::jboss_eap::identity_dir:
    systemdirs => $profiles::rhel7::jboss_eap::system_base_dirs,
    owner      => $profiles::rhel7::jboss_eap::eap_owner,
    group      => $profiles::rhel7::jboss_eap::eap_group,
    mode       => '0750',
  }

  # Deploy vault if requested
  if $profiles::rhel7::jboss_eap::deploy_vault {
    file { "${profiles::rhel7::jboss_eap::identity_dir}/vault":
      ensure  => directory,
      recurse => true,
      purge   => true,
      source  => $profiles::rhel7::jboss_eap::vault_location,
    }
  }

  # Deploy identity cert/key if requested
  if $profiles::rhel7::jboss_eap::identity_cert {
    if ! $profiles::rhel7::jboss_eap::identity_private {
      fail("Identity certificate specified by no corresponding key provided.")
    }

    validate_re($profiles::rhel7::jboss_eap::keystore_type, ['^jceks$', '^pkcs12$'])

    # The java_ks module provides not mechanism to directly specify
    # the owner, group and mode of the resultant keystore. However,
    # if there is an empty file with the same name it will retain the
    # ownership and mode. Therefore, we will ensure that there is an
    # existing file with the proper ownership first.
    $keystore_file = "${profiles::rhel7::jboss_eap::identity_dir}/${profiles::rhel7::jboss_eap::keystore_name}"
    file { $keystore_file:
      ensure  => file,
      replace => false,
      require     => File[$profiles::rhel7::jboss_eap::identity_dir],
    }

    java_ks { "${::fqdn}":
      ensure      => latest,
      target      => $keystore_file,
      certificate => $profiles::rhel7::jboss_eap::identity_cert,
      private_key => $profiles::rhel7::jboss_eap::identity_private,
      password    => $profiles::rhel7::jboss_eap::keystore_password,
      path        => ["${profiles::rhel7::jboss_eap::jdk_install_dir}/bin", '/bin', '/usr/bin'],
      require     => File[$keystore_file],
    }
  }
}
