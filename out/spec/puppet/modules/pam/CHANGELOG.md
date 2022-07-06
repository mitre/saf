## Supported Release 0.2.2
### Summary

Bugfix release only.

#### Bugfixes
- Added '*.puppet-bak' to the list of files excluded from being purged from 
  limits.d. Without this files are re-backed up every time and keep getting
  '.puppet-bak' appended until they reach the filename character limit.

## Supported Release 0.2.1
### Summary

Bugfix release only.

#### Bugfixes
- Fixed logic error where Augeas resources were titled only with 'type:value' which 
  could lead to duplicate resource declarations when multiple domains required
  the same settings. Added 'domain' to the title to ensure uniqueness.

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
