## Supported Release 0.2.0
### Summary

Feature release only.

#### Features
- Added feature to automatically remove the package if the
  'vra_provisioned' fact is either not present or set to false.
  This way a VM template with the agent already installed can
  still be used with machines that are not provisioned with vRA
  and the agent will be removed during provisioning (if Puppet
  is used).

## Supported Release 0.1.2
### Summary

Bugfix release only.

#### Bugfixes
- Fixed the 'rungugent.properties.erb' template so that the
  'ssl_option_property' correctly gets values of 'True' or
  'False' as opposed to 'ssl'. Without 'True' the rungugent.sh
  script will not attempt to use https as required.

## Supported Release 0.1.1
### Summary

Bugfix release only.

#### Bugfixes
- Fixed a logic error in the custom fact script (gugent_facts.sh)
  which prevented the setting of 'gugent_successful' if the agent
  had never been installed before and/or the log file does not exist.

- While not truly a bug I reordered the various checks before
  running the module. Since the module is only intended to run for 
  virtual machines which were deployed with vRA, the existence
  of the custom fact, 'vra_provisioned', is indicative of the fact
  that this is a virtual machine. Therefore, the check for 
  '$::is_virtual' was redundant and removed. I then moved the 
  checks against the 'vra_provisioned' fact before the check
  for the 'gugent_successful' fact because there is no reason
  to check if the agent installation was previously successful
  if it's not even applicable to this system.
