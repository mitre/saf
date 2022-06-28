## Supported Release 0.30.1
### Summary

Bugfix release only.

#### Bugfixes
- Fixed typo in the hiera lookup for the system timezone in the
  base profile.

## Supported Release 0.30.0
### Summary

Feature release only.

#### Feature
- Add feature to the 'base' module to set the system timezone.

## Supported Release 0.29.0
### Summary

Feature release only.

#### Feature
- Now require the 'lkimmel-cron' module to provide cron.allow/deny
  functionality.
- Add the addition of Oracle application accounts to cron.allow.
- Update the 'base' profile to utilize the new 'lkimmel-cron' module
  for initializing permissions on cron.allow.

## Supported Release 0.28.1
### Summary

Bugfix release only.

#### Bugfixes
- Fix faulty variable reference in the password update for v0.28.0.

## Supported Release 0.28.0
### Summary

Feature release only.

#### Feature
- Add the option to force password updates for the Oracle user
  accounts. Previously, the password parameter would only apply
  to new users so as to not continually override passwords set
  locally. This feature allows for the mass update of the passwords
  specific to the Oracle accounts (only).

## Supported Release 0.27.1
### Summary

Bugfix release only.

#### Bugfixes
- Move the creation of the PSU fact, indicating the need to run,
  to a location that applies to all hosts anytime a PSU file
  is specified. The previous configuration assumed that things would
  work the first time but if there was a failure applying the PSU
  it would not attempt again.

## Supported Release 0.27.0
### Summary

Feature release only.

#### Feature
- Added ability to deploy Commvault agents during Oracle database
  deployment.

## Supported Release 0.26.1
### Summary

Bugfix release only.

#### Bugfixes
- Fixed logic flaw which prevented PSU from being applied after
  OPatch was being updated.

## Supported Release 0.26.0
### Summary

Feature release only.

#### Feature
- Update the installdb class to include logic to direct the 
  update of OPatch and the installation of database PSU.
- Update the main class to test for when a database PSU needs
  to be applied.
- Now required updated oradb module (v0.5.0)

## Supported Release 0.25.0
### Summary

Feature and bugfix release.

#### Feature
- Now require v0.2.0 of jboss_eap to support the configuration of
  IPv6 and arbitrary JAVA_OPTS.

#### Bugfixes
- Periodic failures of the jboss-cli tool were noticed. The issue was
  that the default connection uses 'localhost' which, when IPv6 is
  enabled, seems to sometimes resolve to the IPv6 localhost (::1)
  address. This causes failures when the system is using IPv4. We now
  pass 'localhost4' as the 'management_ip' to jboss_admin::server
  to avoid ambiguity.

## Supported Release 0.24.0
### Summary

Feature release only.

#### Feature
- Pass 'default_gateway' to the add_ipv6 module to support the
  configuration of a default IPv6 gateway. Previously, the
  add_ipv6 module was generating a gateway address but the logic
  was not universal or flexible. It is now the responsibility of
  some external mechanism to provide the IPv6 default gateway to
  the add_ipv6 module.

## Supported Release 0.23.1
### Summary

Bugfix release only.

#### Bugfixes
- Now require oradb v0.4.0 to provide proper directory ownership.

## Supported Release 0.23.0
### Summary

Feature release only.

#### Feature
- Add the ability to change the LogInsight server for the 'base'
  profile. Previously, the value would only ever be set to the
  initial value provided. Now the LogInsight package will be
  reinstalled when a new endpoint URL is provided.
- Ensure that the LogInsight package is absent if a server
  endpoint is not provided. This can be used to remove LogInsight
  as well.

## Supported Release 0.22.1
### Summary

Bugfix release only.

#### Bugfixes
- Update the Oracle external fact script to exit if facts are not
  found indicating that this is an Oracle system. Before this 
  all hosts would tend to report a non-zero exit code from the 
  Oracle external fact script which was harmless but misleading.
- Fix typo in profiles that were using the 'firewall_ports' defined
  type. 

## Supported Release 0.22.0
### Summary

Feature release only.

#### Feature
- Place all deployment orchestration into the oracle_db profile.
  Previously, some of the orchestration and notifications were
  handled by the oradb module. I thought it made more sense if the
  oradb module were to act only upon local nodes and not have
  a dependency on 'theforeman-foreman' in order to function.

## Supported Release 0.21.1
### Summary

Bugfix release only.

#### Bugfixes
- Fix logic bug where, if a tempuser is specified for the Grid 
  and/or Oracle user, the complete_preconfig class may never finish
  as expected if the tempuser(s) have already been removed.

## Supported Release 0.21.0
### Summary

Bugfix and feature release.

#### Bugfixes
- Modify external fact and move shmall/shmmax calculations into the
  puppet manifest (os_config) to ensure that we use a configurable
  minimum value for shmall and our calculations reflect those 
  recommended by Oracle. 

#### Feature
- We now allow for a fact to be set that will override Hiera
  values for minimum_hugepages. This allows for setting per-host
  hugepage values on systems which are dynamically built and we
  can't create Hiera configuration beforehand.

## Supported Release 0.20.2
### Summary

Bugfix release only.

#### Bugfixes
- Fix reference to disk_redundancy when passing to oradb/installasm.

## Supported Release 0.20.1
### Summary

Bugfix release only.

#### Bugfixes
- Update calculations for shmall and shmmax when used with hugepages.
- Update the default calculation for shmall to change the unit to 
  pages (getconf PAGE_SIZE) instead of bytes.
- Update the passed value to be either the hugepages variant or default
  values based on whether hugepages were requested (minimum_hugepages>0).

## Supported Release 0.20.0
### Summary

Bugfix and feature release.

#### Bugfixes
- Update the 'firewall_ports' defined type to no longer accept a hash
  as a title value. This is to make the type compatible with Puppet 4.
- Updated profiles utilizing this type to work with the new syntax.
  Mostly this required the use of a new custom function (array_to_hash)
  see the new feature description below.

#### Feature
- Add custom function 'array_to_hash'. This function is used to take an
  array (generally from Hiera) which is intended to be a list of resources
  to create. In some cases the resource may need to be a hash in order to
  specify customized input parameters. The array members which are not 
  already hashes will be converted to hash keys with an empty hash value.
  The resulting hash is suitable for use with the 'create_resources'
  function while allowing the Hiera data to remain as terse as possible.
- Add features to the 'oracle_db' profile to unconfigure Transparent
  Hugepages.
- Add feature to calculate and configure required Hugepages and memlock
  values.

## Supported Release 0.19.1
### Summary

Bugfix release only.

#### Bugfixes
- Fix a logic flaw with the exec resources used to add 'umask' to the 
  oracle users' .bashrc files. The previous logic was setting:
  umask=<value> instead of 'umask <value>'.

## Supported Release 0.19.0
### Summary

Bugfix and feature release only.

#### Bugfixes
- Fix a logic error where the 'file_line' resource was only configured to
  add a line but not replace the existing line which was intended.

#### Feature
- Add the 'nfs_client' profile which adds required SPNs and configures
  Autofs mounts.

## Supported Release 0.18.1
### Summary

Bugfix release only.

#### Bugfixes
- Fix a typo in custom function 'count_dig_values'.

## Supported Release 0.18.0
### Summary

Feature release only.

#### Feature
- Updated the 'ad_client' profile to allow for the input of arbitrary file
  content using the 'users' module defined types ('user_files'). This feature
  is meant to ease the enablement of ksu but can be used for other purposes.

## Supported Release 0.17.0
### Summary

Feature release only.

#### Feature
- Added initial oracle_db profile functionality. Installs Oracle RAC/Grid
  software and Oracle DB software.
### Summary

Feature release only.

#### Feature
- Added initial oracle_db profile functionality. Installs Oracle RAC/Grid
  software and Oracle DB software.

## Supported Release 0.16.0
### Summary

Feature release only.

#### Feature
- Removed the 'borrowed' foreman function from this module and made the 
  theforeman-foreman module containing the original function a requirement
  for this module. It became obvious that the function had a wider use
  outside of our profiles and would serve better as a library in its 
  original module.

## Supported Release 0.15.1
### Summary

Bugfix release only.

#### Bugfixes
- Included new options 'exclude_users' and 'managed_users' for the users module
  which allow us to avoid duplicate resource declarations when certain user
  accounts are managed by other modules.

## Supported Release 0.15.0
### Summary

Feature release only.

#### Feature
- Add the ability to add arbitrary pam file configuration vi a Hiera (YAML) entry
  formatted for use with 'create_resources'.

## Supported Release 0.14.1
### Summary

Bugfix release only.

#### Bugfixes
- Move the add_ipv6 class call to a 'pre' stage which comes before 'main'. This is to
  ensure that the interface is restarted before any number of things that may be
  interrupted by its disconnection. The previous configuration (v0.14.0) caused a
  dependency cycle.

## Supported Release 0.14.0
### Summary

Feature release only.

#### Features
- Ensure that SSSD is restarted if any interfaces are bounced due to IPv6 configuration.
  There was a _possible_ issue where SSSD would not configure properly due to the
  network dropping out from under it.

## Supported Release 0.13.2
### Summary

Bugfix release only.

#### Bugfixes
- Updated the web content deployment file resource in the simple_webserver profile
  to specify owner/group/mode. Previously it was inheriting permissions from the 
  Puppet/file server which could lead to access denied.

## Supported Release 0.13.1
### Summary

Bugfix release only.

#### Bugfixes
- Updated the 'firewall_ports' defined type name declaration from previous update.

## Supported Release 0.13.0
### Summary

Feature release only.

#### Features
- Added the ability to specify arbitrary firewall ports via the 'base' profile 
  through the 'firewall_ports' parameter.
- Moved the 'firewall_ports' defined type out of the JBoss profile dow to the 
  root of the module to serve as a usable type for all profiles.
- Updated the JBoss profile to the 'firewall_ports' defined type at the root
  of the profiles module instead of its 'own' defined type.

## Supported Release 0.12.2
### Summary

Bugfix release only.

#### Bugfixes
- Fixed a bug where indeterminent order could allow the jboss_batch configurations
  to begin running before the identity store pieces (vault, keystores) were in 
  place which would result in the inability to access the vault/keystore and the
  batch would fail.

## Supported Release 0.12.1
### Summary

Bugfix release only.

#### Bugfixes
- Add logic so that when a deployment source directory is NOT
  provided we don't try to provide directory overrides via the collector
  in server_instances.pp.

## Supported Release 0.12.0
### Summary

Feature release only.

#### Features
- Add initial implementation of new profile to deploy JBoss EAP.

## Supported Release 0.11.2
### Summary

Bugfix release only.

#### Bugfixes
- Set gugent-related parameters with a default value of 'undef'. Without
  this default the the profile would fail when a gugent server is not provided.
  However, the function of the gugent module is to do nothing when a server
  is not provided. We need to make it possible to pass nothing.
- Fix a type in the base profile parameter 'sssd_include_services' which was
  preventing an actual value from being passed to the sssd module. 
- Update the sample satellite.yaml file with the value 'ifp' configured for
  parameter 'sssd_include_services'. Without this Satellite SSO wouldn't work
  properly.

## Supported Release 0.11.1
### Summary

Bugfix release only.

#### Bugfixes
- Removed a dependency for the ad_client class to run AFTER the sshd class.
  With the inclusion of the sshd defined type in the ad_client class we now
  have to allow the sshd class to run during/after the ad_client class.

## Supported Release 0.11.0
### Summary

Feature release only.

#### Features
- Previously the rhel7::ad_client profile simply relied upon the 'base' profile
  to configure sshd properly because the base sshd module was not set up to
  allow concurrent modification. The sshd module was changed to provide a defined
  type to allow configuration to be applied by multiple external classes. 
  From this change we now implement the ad_client class to explicitly pass settings
  to the sshd module via the new defined type (sshd::sshd_settings).

## Supported Release 0.10.0
### Summary

Feature release only.

#### Features
- Rework the parameter declarations for all profile classes. Previously all
  parameters were defined with Hiera calls for variable lookup due to a mistaken
  belief about the mutual exclusivity between 'automatic parameter lookup' and 
  Hiera function calls. Instead we now name parameters intended to be merged 
  with a unique name in the data files so that automatic parameter lookup does
  not overwrite our Hiera function calls. With this change we can now merge
  values that we want while also easily passing values with automatic parameter
  lookup (APL). The APL will allow us to do more flexible things with classes
  that do not expose their parameters for modification. 
- Change the way that extra audit rules are parsed (using create_resources)

## Supported Release 0.9.0
### Summary

Feature release only.

#### Features
- Rework the way that default values are passed to the base module(s). Originally
  I was configuring for automatic parameter lookup but this is disabled on the
  Puppet server in favor of doing direct Hiera lookups which allow for more
  flexibility in constructing parameters using merging, etc.

## Supported Release 0.8.0
### Summary

Feature release only.

#### Features
- Added profile 'simple_webserver'. This is a very basic installation of Apache
  HTTPD which allows for the input of a directory to copy into 'docroot'. All
  of the settings are driven by Hiera configuration looked up for the target
  host. There is also input for a port to open on the firewall.

## Supported Release 0.7.0
### Summary

Feature release only.

#### Features
- Modified the 'ad_client' profile to take only the 'nix_ou' parameter instead
  of combining 'nix_ou_base' and 'nix_ou'. 

- Updated so that 'join_user' and 'join_pass' are absolutely required before
  running. This will prevent sssd from failing when the domain isn't actually
  joined.

- Modified the join command to allow for situations where the OU isn't provided.
  This will allow the computer object to be created in the default 'computers' OU.

- Added option to not update DNS. This is valuable when using a DNS source other
  than AD. Otherwise the 'net' command has to wait to timeout trying to update
  DNS that doesn't exist.

## Supported Release 0.6.1
### Summary

Bugfix release only.

#### Bugfixes
- Fixed a typo in the RHEL7 'base' class that was causing a bad lookup for the
  'sudoers_stig_exclude' parameter which led to a misleading warning message from
  the sudo module.

## Supported Release 0.6.0
### Summary

Feature release only.

#### Features
- Added the ability for users to add arbitrary sssd configuration files via Hiera
  or ENC. The configuration is passed via a hash compatible with 'create_resources'.
  The name of the Hiera parameter is 'profiles::rhel7::base::sssd_configs'.

- Added the ability for users to add arbitrary sudo configuration files via Hiera
  or ENC. The configuration is passed via a hash compatible with 'create_resources'.
  The name of the Hiera parameter is 'profiles::rhel7::base::sudoers_files'.

## Supported Release 0.5.0
### Summary

Feature and bugfix release.

#### Features
- Added the ability to filter exclude files from purging and STIGing in the 'sudo' module.
  This is useful when the base profile is applied to systems that have sudo rules/files
  deployed by an external application that shouldn't be purged or modified by Puppet.
  Also, set these values to default of empty lists '[]' so that they don't have to be
  explicitly set by Hiera or an ENC.

#### Bugfixes
- Added parameter 'set_comments' to the 'yum' and 'auditd' modules. Comments were, by 
  default, being configured on these configuration files and there was no way to prevent
  it.

## Supported Release 0.4.0
### Summary

Feature and bugfix release.

#### Features
- Added logic to allow for the LogInsight agent installation to be skipped. Some environments
  may not have a LogInsight infrastructure and this will prevent this step from stopping
  complettion of the configuration. This feature can be enabled by NOT providing a Hiera
  value at all or by explicitly setting the Hiera value to '~' or 'null'.

- Added the 'vmware_gugent' module to the base profile. This module is added to the 'finalize'
  run stage and is ordered after 'add_ipv6' so as to run absolute last.

#### Bugfixes
- Added a default (empty array) for 'sssd_exclude_list' for when the 'base' profile is run
  in the absence of other modules needing to modify sssd. Without this change the
  'sssd_exclude_list' would need to be passed in some Hiera file that doesn't make sense 
  for it to be in.

## Supported Release 0.3.2
### Summary

Bugfix release only.

#### Bugfixes
- Changed the name of the ssh_client parameter 'custom_settings' to 'host_settings' to match
  updated implementation of the 'ssh_client' module.

## Supported Release 0.3.1
### Summary

Bugfix release only.

#### Bugfixes
- Added run stages to the base profile to ensure that aide runs next to last (to capture up-to-date
  file information) and that network config runs last so as to not interrupt Puppet communication.

## Supported Release 0.3.0
### Summary

This release adds functionality.

#### Features
- Added a call to new module (add_ipv6) to dynamically determine IPv6 information for each existing
  interface and add it to the existing configuration files.

## Supported Release 0.2.0
### Summary

This release adds functionality.

#### Features
- Added a feature to install (dirty) the VMware Log Insight Agent and to ensure the agent is runnning.
  The feature was not implemented as a module because the VMware team recommends that the installation
  is managed from the server and not the client. All we need to do is install the package and ensure
  that the service is running.

## Supported Release 0.1.3
### Summary

Bugfix release only.

#### Bugfixes
- Fixed issue where pam_password_lines and pam_auth_lines did not have correct empty lines due to 
  being a 'hiera_array' lookup which was removing duplicate empty lines. Changed simply to a 'hiera'
  lookup so that only highest level data file takes effect.

## Supported Release 0.1.2
### Summary

Bugfix release only.

#### Bugfixes
- Fixed typos in parameter definitions that were preventing valid data lookups.

