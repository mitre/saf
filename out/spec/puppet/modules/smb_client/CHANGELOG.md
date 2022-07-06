## Supported Release 0.2.2
### Summary

Bugfix release only.

#### Bugfixes
- Modified smb.conf.erb to add explicit namespacing to work with Puppet 4.

## Supported Release 0.2.1
### Summary

Bugfix release only.

#### Bugfixes
- Changed the permissions on smb.conf to match the defaults set by the package installation.
  (0644/root:root)

## Supported Release 0.2.0
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
