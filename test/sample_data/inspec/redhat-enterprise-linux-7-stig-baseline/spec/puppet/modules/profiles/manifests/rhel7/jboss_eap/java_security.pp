class profiles::rhel7::jboss_eap::java_security 
{
  $jdk_install_dir = $profiles::rhel7::jboss_eap::jdk_install_dir

  if $profiles::rhel7::jboss_eap::system_cacerts {
    # Link cacerts to system cacerts
    file { "${profiles::rhel7::jboss_eap::jdk_install_dir}/${profiles::rhel7::jboss_eap::jdk_cacerts_file}":
      ensure  => link,
      backup  => true,
      target  => $profiles::rhel7::jboss_eap::system_cacerts,
    }
  }

  if $profiles::rhel7::jboss_eap::jdk_removes {
    # Cleanup uneeded/unwanted components
    $remove_files = prefix($profiles::rhel7::jboss_eap::jdk_removes, "${jdk_install_dir}/")
    file { $remove_files:
      ensure  => absent,
    }
  }

  if $profiles::rhel7::jboss_eap::jdk_security_settings {
    $joined_settings = join_keys_to_values($profiles::rhel7::jboss_eap::jdk_security_settings,':')
    # Enable customized security settings
    profiles::do_simple_vars { $joined_settings:
      file        => "${jdk_install_dir}/jre/lib/security/java.security",
      lens        => 'properties.lns',
      set_comment => $profiles::rhel7::jboss_eap::set_comments,
    }
  }
}
