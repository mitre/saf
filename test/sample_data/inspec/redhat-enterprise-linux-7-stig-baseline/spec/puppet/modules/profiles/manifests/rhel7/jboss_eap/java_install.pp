class profiles::rhel7::jboss_eap::java_install
{
  include profiles
  include profiles::rhel7::jboss_eap

  # Create JDK group if requested. Otherwise use EAP group.
  if $profiles::rhel7::jboss_eap::jdk_group {
    if ! $profiles::rhel7::jboss_eap::jdk_group_id {
      fail('JDK group was specified but no GID provided!')
    }
    group { $profiles::rhel7::jboss_eap::jdk_group:
      ensure  => present,
      gid     => $profiles::rhel7::jboss_eap::jdk_group_id,
    }
    $jdk_real_group = $profiles::rhel7::jboss_eap::jdk_group
  } else {
    $jdk_real_group = $profiles::rhel7::jboss_eap::eap_group
  }

  # Create JDK user if requested. Otherwise use EAP user.
  if $profiles::rhel7::jboss_eap::jdk_owner {
    if ! $profiles::rhel7::jboss_eap::jdk_owner_id {
      fail('JDK owner was specified but no UID provided!')
    }
    user { $profiles::rhel7::jboss_eap::jdk_owner:
      ensure => present,
      uid    => $profiles::rhel7::jboss_eap::jdk_owner_id,
      shell  => $profiles::rhel7::jboss_eap::jdk_owner_shell,
      groups => $jdk_real_group,
      require => Group[$jdk_real_group]
    }
    $jdk_real_owner = $profiles::rhel7::jboss_eap::jdk_owner
  } else {
    $jdk_real_owner = $profiles::rhel7::jboss_eap::eap_owner
  }

  # Create directory structure for Java excluding the lowest 
  # level directory. Creation of this directory will be left
  # to the module itself.
  $parent_dir = dirname($profiles::rhel7::jboss_eap::jdk_install_dir)
  profiles::build_dir { $parent_dir:
    systemdirs => $profiles::rhel7::jboss_eap::system_base_dirs,
    owner      => $jdk_real_owner,
    group      => $jdk_real_group,
    mode       => '0750',
  }

  # Select requested JDK type
  case $profiles::rhel7::jboss_eap::jdk_type {
    'oracle': { 
                java_archive::oracle_jdk { 'Deploy Oracle JDK for JBoss EAP':
                  owner              => $jdk_real_owner,
                  group              => $jdk_real_group,
                  install_dir        => $profiles::rhel7::jboss_eap::jdk_install_dir,
                  package_name       => $profiles::rhel7::jboss_eap::jdk_filename,
                  checksum           => $profiles::rhel7::jboss_eap::jdk_checksum,
                  checksum_type      => $profiles::rhel7::jboss_eap::jdk_checksum_type,
                  archive_source     => $profiles::rhel7::jboss_eap::archive_stage_location,
                  before             => Exec['Configure alternatives'],
                }
              }
    default:  { fail("Invalid JDK type ($profiles::rhel7::jboss_eap::jdk_type) provided.") }
  }

  # Set up alternatives for systems where there is no initial JDK/JRE
  exec { 'Configure alternatives':
    command => "alternatives --install /usr/bin/java java ${parent_dir}/java/bin/java 2000 \
               --family local-jboss-jdk \
               --slave /usr/bin/keytool keytool ${parent_dir}/java/bin/keytool",
    path    => ['/bin','/usr/bin','/sbin','/usr/sbin'],
    unless  => "alternatives --display java | grep -q ${parent_dir}/java",
  }
}
