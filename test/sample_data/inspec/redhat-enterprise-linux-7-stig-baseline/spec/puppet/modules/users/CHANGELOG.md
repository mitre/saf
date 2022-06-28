## Supported Release 0.5.0
### Summary

Feature release only.

#### Features
- Added the ability to distribute binary files using the  'user_files'
and 'user_files/files' defined types. Binary file data must be converted
to base64, prefixed with 'BASE64:' and used as the value of 'content' for
the target file hash.

## Supported Release 0.4.0
### Summary

Feature release only.

#### Features
- Added the 'user_files' and 'user_files/files' defined types. These types
  provide the ability to configure content in arbitrary files under the
  home directory of any user on the system.

## Supported Release 0.3.1
### Summary

Bugfix release only.

#### Bugfixes
- Updated the module to allow for the exclusion of certain users from any 
  modification. This helps prevent duplicate resource declaratios when
  users are created from other modules.
- Updated to take in a list of 'managed_users' which informs this module
  of users being managed from other modules. In this way we can have
  foreknowledge of existing users and attept to override their parameters
  instead of creating a duplicate user resource.

## Supported Release 0.3.0
### Summary

Feature release only.

#### Features
- Updated the 'remove_users' defined type to inherit default values for the
  crontab and mail locations.

## Supported Release 0.2.1
### Summary

Bugfix release only.

#### Bugfixes
- Modified remove_users.pp to work with the new 'local_user_info' fact format.

## Supported Release 0.2.0
### Summary

Feature release only.

#### Features
- Updated to provide the 'local_user_info' as a string representation of a hash
  which can be parsed with the 'stdlib' 'parsejson' function. 
- Add SSH public keys to local users info, where applicable.

## Supported Release 0.1.1
### Summary

Bugfix release only.

#### Bugfixes
- Fixed variable references in the add_users defined type. They were referencing
  'local' variables from the init manifest. This was an artifact from when the
  users were directly created in the main class (init.pp).
