## Supported Release 0.3.2
### Summary

Bugfix release only.

#### Bugfixes
- Fixed bug where nsswitch.conf was being defined incorrectly for RHEL7
  and the settings were getting placed in /etc/nsswitch instead of
  /etc/nsswitch.conf.

## Supported Release 0.3.1
### Summary

Bugfix release only.

#### Bugfixes
- Add namespace prefixes to several variables which were missing them.

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
- Modify the 'config_file' defined type so that we don't have to
  pass a base filename. We will still allow this but unless
  overridden this will inherit the name (namevar) passed when
  calling the defined type. This makes the defined type more
  intuitive and less clunky when defining in Hiera.
