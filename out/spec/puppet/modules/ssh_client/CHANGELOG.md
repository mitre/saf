## Supported Release 0.3.0
### Summary

Feature release only

#### Features
- Enabled a new parameter to the defined resource type 'ssh_host_entry'
  , 'ins_before', which allows for ordering of the host filters before
  some other pre-existing filter.
- Enabled a new paramter, 'remove_opts', which allows for the removal
  of specific parameters from existing filters. This is particularly
  useful where there are existing parameters on a general filter that
  conflict with parameters on a more specific filter. A specific
  example would be 'GSSAPIAuthentication' existing under the filter
  '*'. In the case that we want to enable GSSAPI authentication on 
  a domain-level but not to ALL hosts, we need to remove the setting
  from the general, '*', filter. Merely setting this to 'no' results
  in all hosts being restricted from using GSSAPI authentication
  because only the first parsed option takes effect.

## Supported Release 0.2.2
### Summary

Bugfix release only

#### Bugfixes
- Forgot to update ordering references after the namevar change in
  version 0.2.1.

## Supported Release 0.2.1
### Summary

Bugfix release only

#### Bugfixes
- Modified 'do_simple_vars' defined type to differentiate settings
  from those of sshd_config and from other host-based filters in
  the same ssh_config file. This is achieved by adding the Augeas
  context to the Augeas resource namevar (title).

## Supported Release 0.2.0
### Summary

Bugfix and feature release

#### Bugfixes
- Previously the module only allowed direct addition of key/value
  settings. This is not the way that ssh_config works. Everything
  is arranged under a host or match filter. Updated to allows for
  host-based filtering.

#### Features
- In order to implement the host-based filtering bug fix a 
  defined type was created that now allows users to directly call
  the defined type to add a host filtering section in the ssh
  configuration.

