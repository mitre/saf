##2018-09-19 - Release 0.1.0
### Summary
Rework to build cron.allow and cron.deny from concat fragments to allow for multiple
applications to add users to the file.

##2017-02-20 - Release 2.2.0
### Summary
Clarify Ubuntu support (remove descriptions pointing to Debian)
Support Puppet 4.9
Appease Puppet Forge scoring

##2016-08-01 - Release 2.1.0
### Summary
Fixed periodic cron jobs not getting removed on RHEL5 and Suse anymore.
If you want to keep the old unfixed behaviour of the module, set $periodic_jobs_manage to false.

##2015-12-08 - Release 2.0.0
### Summary
####Breaking News
This release breaks with backward compatibility in these cases:
##### parameters that have been renamed
- ```cron::enable_cron``` to ```cron::service_enable```
- ```cron::ensure_state``` to ```cron::service_ensure```
- ```cron::fragment::ensure_cron``` to ```cron::fragment::ensure```
- ```cron::fragment::cron_content``` to ```cron::fragment::content```

For convenient transition, there is support using the old names for a limited time.
This comes at the price of deprecation warnings.

##### cron.deny is created by default now

  This changes the default behavior so cron.deny is created (empty) by
  default. This is in line with what is default from the cron packages.

##### Do not change cron.{allow|deny} ensure value

  This fixes an issue where cron.allow would always be created if
  cron_allow_users is defined in Hiera, even though cron_allow is set to
  'absent' higher up in the hierarchy.

####Features
- Add package_name and service_name parameters
- Add support for SLES 12
- Add possibility to manage file attributes of cron related directories
- Add possibility to manage file attributes of fragment files
- Add support for hourly cron jobs fragment files
- Allow to use 'file' for cron.{allow|deny} ensure parameter

####Bugfixes
- Add documentation for cron::fragment
- Fix dependency for fragment files
- Validate $cron_files being a hash


####Upgrading from 1.x
When upgrading from version 1.x you need to search for the deprecated parameter names
and replace them with the new names. There is no need to change the data itself.

In most cases it should be good enough to change the keys in $cron_files hashes to the new names.

#####Hiera Example:
old deprecated names
<pre>
cron::cron_files:
     'daily_task':
       ensure_cron: 'present'
       type: 'daily'
       cron_content: |
            #!/bin/bash
            # This File is managed by puppet
            command
</pre>

new parameter names
<pre>
cron::cron_files:
     'daily_task':
       ensure: 'present'
       type: 'daily'
       content: |
            #!/bin/bash
            # This File is managed by puppet
            command
</pre>

#####Code Example:
old deprecated names
<pre>
cron::fragment { 'daily_task':
  ensure_cron  => 'present',
  type         => 'daily',
  cron_content => "#!/bin/bash\n# This File is managed by puppet\ncommand",
}
</pre>

new parameter names
<pre>
cron::fragment { 'daily_task':
  ensure  => 'present',
  type    => 'daily',
  content => "#!/bin/bash\n# This File is managed by puppet\ncommand",
}
</pre>
