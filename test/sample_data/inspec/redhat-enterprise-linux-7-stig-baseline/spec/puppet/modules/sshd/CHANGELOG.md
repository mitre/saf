## Supported Release 0.2.2
### Summary

Bugfix release only.

#### Bugfixes
- Updated conditional statement to work with Puppet4 where empty strings
  are no longer interpreted as 'undef'. An undef value matches string 
  literal 'undef'.

## Supported Release 0.2.1
### Summary

Bugfix release only.

#### Bugfixes
- Fixed a missed reference between Augeas resources that caused catalog
  compilation failure.

## Supported Release 0.2.0
### Summary

Feature release only.

#### Features
- Change the local 'utility' defined type to a public defined type.
  This defined type accepts a hash of setting/value pairs which are then
  added to sshd_config. No checking is done for the validity of entered
  options.
