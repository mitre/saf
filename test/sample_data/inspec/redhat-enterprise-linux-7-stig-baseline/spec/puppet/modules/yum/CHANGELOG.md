## Supported Release 0.2.1
### Summary

Bugfix release only.

#### Bugfixes
- Removed unnecessary parameter references. They were likely harmless but
  removed nonetheless.

## Supported Release 0.2.0
### Summary

Feature release only.

#### Features
- Added parameter 'set_comments' to init.pp. Added parameter 'set_comment' to
  'do_yum_config.pp' defined type. Updated config.pp to pass 'set_comment' to
  'do_yum_config.pp' in order to override comments, if required. Also, added
  logic to 'do_yum_config.pp' that will add or remove comments based on the 
  input parameter 'set_comment'.

## Supported Release 0.1.2
### Summary

Bugfix release only.

#### Bugfixes
- Modified the package installation logic so that to make the priority configurable.
  Previously packages listed for removal ALWAYS took precedence over pakages to be
  installed. This made it difficult to override packages listed for removal but that
  are required on some servers. By supplying 'pkg_priority => "install"' we can now
  override so that the package is installed.
