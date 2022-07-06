## Supported Release 1.0.1
### Summary

Bugfix release only.

#### Bugfixes
- Fixed issue with the interface_ipv6 defined type where there 
  was a duplicate resource declaration when multiple interfaces
  are used.

## Supported Release 1.0.0
### Summary

Feature release only.

#### Features
- Remove logic used to determine and configure a default gateway.
  The logic was to restrictive and would not necessarily enable
  the ability to configure the appropriate gateway. 
- Add a required parameter for default_gateway. This should be
  determined externally per appropriate business logic.

## Supported Release 0.3.2
### Summary

Bugfix release only.

#### Bugfixes
- Fix bug where, if no IPv4 address is returned for the hostname, 
  the external fact exits with a non-zero code and the facts are
  not returned. 

## Supported Release 0.3.1
### Summary

Bugfix release only.

#### Bugfixes
- Remove '\' characters for line breaks in function call in config.pp
  which were causing failed runs.

## Supported Release 0.3.0
### Summary

Feature release only.

#### Features
- Provide a switch to allow specifying whether an interface is restarted
  after adding IPv6 information.

## Supported Release 0.2.1
### Summary

Bugfix release only.

#### Bugfixes
- Fixed bug where module would completely fail if no IPv6 addresses
  were found in DNS. The appropriate behavior is to do nothing in 
  such a case. The failure would cause the entire Puppet run to fail.

## Supported Release 0.2.0
### Summary

Full shift in the way that the module is implemented.

#### Features
- Changed the module so that options were not statically predefined.
  A set of sane defaults is still available with the 'automatic' flag
  set. However, users can utilize the provided defined type ('interface_ipv6')
  and pass a hash of the required options which will override the
  defaults. Users can also pass a hash of options to the base class
  but these settings will be applied to all local interfaces.

## Supported Release 0.1.1
### Summary

Bugfix release only.

#### Bugfixes
- Added check for found IPv6 addresses. Exit with a notification.

