## Supported Release 0.3.2
### Summary

Bugfix release only.

#### Bugfixes
- Add a return (NONE) to the sudoers files custom fact and only
  perform modificiations if there are files present.

## Supported Release 0.3.1
### Summary

Bugfix release only.

#### Bugfixes
- Add namespace to call to defined type without proper namespace.

## Supported Release 0.3.0
### Summary

Feature release only.

#### Features
- Updated all ERB templates so that the notice 'THIS FILE IS MANAGED BY PUPPET - DO NOT MODIFY!!'
  is only applied when the module is run from a Puppet Master. That is when
  the fact 'servername' is set. This fact is set by the Puppet Master during
  puppet runs. This feature is useful when puppet modules may also be used
  to statically deploy a system on time. It would be misleading to have 
  administrators believe that Puppet was persistently managing a system in 
  such cases.

## Supported Release 0.2.0
### Summary

Feature release only.

#### Features
- Modify the 'create_files' defined type so that it is easier to
  call from external classes. It was previously requiring the 
  calling class to pass standard file properties (e.g. owner).
  It now inherits the default settings from the 'sudo' class.
- Update the 'config.pp' class to account for the new calling
  method for 'create_files'. We no longer have to explicitly
  pass common file properties.
