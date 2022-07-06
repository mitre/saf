## Supported Release 0.2.4
### Summary

Bugfix release only.

#### Features
- Fixed typo in the name of the default audit configuration file.

## Supported Release 0.2.3
### Summary

Bugfix release only.

#### Features
- Variablized the auditd configuration file. Was previously hard-coded.

## Supported Release 0.2.2
### Summary

Bugfix release only.

#### Bugfixes
- Add proper namespacing to variables in provided templates to
  work with Puppet 4.

## Supported Release 0.2.1
### Summary

Bugfix release only.

#### Bugfixes
- Fixed parameter name typos.

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
