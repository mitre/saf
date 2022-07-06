## Supported Release 0.2.2
### Summary

Bugfix release only.

#### Bugfixes
- Updated sysctl_file defined type to use a string for the file mode to 
  work with Puppet 4.

## Supported Release 0.2.1
### Summary

Bugfix release only.

#### Bugfixes
- Removed reference to unused parameter 'svc_name' which was not relevant
  to this module.

## Supported Release 0.2.0
### Summary

Feature release only.

#### Features
- Added a new defined type to create configuration files underneat the sysctl.d
  directory on operating systems where this is applicable. Added new parameters
  to support this feature.
- Updated the do_simple_vars type to remove values from previously configured
  files when an empty value is passed. This allows values to be overridden
  via Hiera so that they might be applied in another file.
