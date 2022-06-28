## Supported Release 0.3.1
### Summary

Bugfix release only.

#### Bugfixes
- Corrected permissions on keyfile to match the defaults provided by the package.
  (0640/root:chrony).

## Supported Release 0.3.0
### Summary

Feature release only.

#### Features
- Removed the 'commandkey' and 'generatecommandkey' options and defaults as they
  are no longer supported by chrony. Removed the corresponding logic to realize
  the keys file based on 'commandkey'.

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

## Supported Release 0.1.3
### Summary

Bugfix release only.

#### Bugfixes
-Fixed a bug where the 'servers' was input as a string instead of a hash.
