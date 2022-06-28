# puppet-module-cron

Manage the cron configuration files.

- /etc/crontab
- /etc/cron.allow
- /etc/cron.deny
- /etc/cron.d/
- /etc/cron.hourly
- /etc/cron.daily
- /etc/cron.weekly
- /etc/cron.monthly
- /etc/cron.yearly


===

# Compatibility

This module has been tested to work on the following systems with Puppet v3
(with and without the future parser) and Puppet v4 with Ruby versions 1.8.7,
1.9.3, 2.0.0, 2.1.0 and 2.3.1.

 * EL 5
 * EL 6
 * SLES 10
 * SLES 11
 * SLES 12
 * Ubuntu 12

Note that SLES patches ISC's cron such that if cron.allow and cron.deny are
both missing, then root will not be able to access the crontabs. This will
cause errors. Please see the Hiera example below.

===

## Class `cron`

### Parameters
A value of `'undef'` will use the defaults specified by the module.


package_ensure (string)
-----------------------
String for the ensure parameter for the cron package. Valid values are 'installed', 'present' and 'absent'.

- *Default*: 'installed'

package_name (string or array)
------------------------------
Name of the cron package(s). Specify this to change the platform's default.

- *Default*: 'USE_DEFAULTS'

crontab_path (string)
---------------------
String for path to system wide crontab.

- *Default*: '/etc/crontab'

crontab_owner (string)
----------------------
Name of the owner of the crontab file.

- *Default*: 'root'

crontab_group (string)
----------------------
Name of the group of the crontab file.

- *Default*: 'root'

crontab_mode (string)
---------------------
Filemode of the  crontab file. Must use the four-digit octal notation. RegEx: /^[0-9][0-9][0-9][0-9]$/

- *Default*: '0644'

cron_allow (string)
-------------------
If the file cron.allow exists, only users listed in it are allowed to use cron,
and the cron.deny file is ignored. Valid values are 'present' and 'absent'.

- *Default*: 'absent'

cron_deny (string)
------------------
If cron.allow does not exist, users listed in cron.deny are not allowed to use
cron. Valid values are 'present' and 'absent'.

- *Default*: 'present'

cron_allow_path (string)
------------------------
Path to cron.allow.

- *Default*: '/etc/cron.allow'

cron_allow_owner (string)
-------------------------
Name of the owner of the cron_allow file.

- *Default*: 'root'

cron_allow_group (string)
-------------------------
Name of the group of the cron_allow file.

- *Default*: 'root'

cron_allow_mode (string)
------------------------
Filemode of the  cron_allow file. Must use the four-digit octal notation. RegEx: /^[0-9][0-9][0-9][0-9]$/

- *Default*: '0644'

cron_deny_path (string)
-----------------------
Path to cron.deny.

- *Default*: '/etc/cron.deny'

cron_deny_owner (string)
------------------------
Name of the owner of the cron_deny file.

- *Default*: 'root'

cron_deny_group (string)
------------------------
Name of the group of the cron_deny file.

- *Default*: 'root'

cron_deny_mode (string)
-----------------------
Filemode of the  cron_deny file. Must use the four-digit octal notation. RegEx: /^[0-9][0-9][0-9][0-9]$/

- *Default*: '0644'

cron_d_path (string)
--------------------
Path to cron.d directory. Must be an absolute path.

- *Default*: '/etc/cron.d'

cron_hourly_path (string)
-------------------------
Path to cron.d directory. Must be an absolute path.

- *Default*: '/etc/cron.hourly'

cron_daily_path (string)
------------------------
Path to cron.daily directory. Must be an absolute path.

- *Default*: '/etc/cron.daily'

cron_weekly_path (string)
-------------------------
Path to cron.weekly directory. Must be an absolute path.

- *Default*: '/etc/cron.weekly'

cron_monthly_path (string)
--------------------------
Path to cron.monthly directory. Must be an absolute path.

- *Default*: '/etc/cron.monthly'

cron_dir_owner (string)
-----------------------
Name of the owner of the cron directories cron.d, cron.hourly, cron.daily, cron.weekly and cron.monthly.

- *Default*: 'root'

cron_dir_group (string)
-----------------------
Name of the group of the cron.d directories cron.d, cron.hourly, cron.daily, cron.weekly and cron.monthly.

- *Default*: 'root'

cron_dir_mode (string)
----------------------
Filemode of the cron.d directories cron.d, cron.hourly, cron.daily, cron.weekly and cron.monthly. Must use the four-digit octal notation. RegEx: /^[0-9][0-9][0-9][0-9]$/

- *Default*: '0755'

cron_files (hash)
-----------------
Hash of files managed in cron.hourly, cron.daily, cron.weekly, cron.monthly and cron.yearly.
See define cron::fragment for hash structure and examples for examples.

- *Default*: undef

cron_allow_users (array)
------------------------
Array of all users to be included in cron.allow.

- *Default*: undef

cron_deny_users (array)
-----------------------
Array of all users to be included in cron.deny.

- *Default*: undef

crontab_vars (hash)
-------------------
Hash that defines the crontab variables SHELL, PATH, MAILTO, HOME. if this variable is undef the module will use the values defined in crontab template which are SHELL=/bin/bash, PATH=/sbin:/bin:/usr/sbin:/usr/bin, MAILTO=root, HOME=/

- *Default*: undef

crontab_tasks (hash)
--------------------
Hash for crontab tasks.

- *Default*: undef

periodic_jobs_content (array or string)
---------------------------------------
Log entry lines for the periodic jobs section. One entry per line. Leave it unset (undef) to use the OS vendor defaults values.

- *Default*: undef

periodic_jobs_manage (boolean)
------------------------------
Trigger to control if periodic jobs schedules should be included in /etc/crontab.

- *Default*: true

service_enable (bool)
---------------------
Boolean to enable the cron service.

- *Default*: true

service_ensure (string)
-----------------------
String for the ensure parameter for the cron service. Valid values are 'running' and 'stopped'.

- *Default*: 'running'

service_name (string)
---------------------
Name of the cron service. Specify this to change the platform's default.

- *Default*: 'USE_DEFAULTS'


## Sample usage:

**Work on Suse**
<pre>
cron::cron_allow: 'present'
cron::cron_allow_users:
  - root
</pre>

**Define crontab variables**
<pre>
cron::crontab_vars:
  SHELL: /bin/bash
  PATH: /sbin:/bin:/usr/sbin:/usr/bin
  MAILTO: root
  HOME: /root
</pre>

**Create /etc/cron.daily/daily_task**
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

**Manage /etc/cron.allow**
<pre>
cron::cron_allow: 'present'
cron::cron_allow_users:
     - user1

</pre>

**Manage /etc/cron.deny**
<pre>
cron::cron_deny: 'present'
cron::cron_deny_users:
     - user1
</pre>

**Manage /etc/crontab**
<pre>
cron::crontab_tasks:
   'task1':
    - "* 12 * * 7 username echo 'Hello World'"
    - "2 2 * * 6 username echo 'tes'"
   'task2':
    - "* 6 * * 7 root echo 'test'"
</pre>

## Define `cron::fragment`

### Parameters

ensure (string)
---------------
String for the ensure parameter of the cron fragment file. Valid values are 'absent', 'file' and 'present'.

- *Default*: 'absent'

content (string)
----------------
String to represent contents of cron job.

- *Default*: ''

owner (string)
--------------
Name of the owner of the fragment file.

- *Default*: 'root'

group (string)
--------------
Name of the group of the fragment file.

- *Default*: 'root'

mode (string)
-------------
Filemode of the fragment file. Must use the four-digit octal notation. RegEx: /^[0-7]{4}$/
By default it will depend on the used type parameter (see below). If type is set to 'd' it will set mode to '0644', in all other cases it will set mode to '0755'.

- *Default*: 'USE_DEFAULTS'

type (string)
-------------
The type of cron job. This generally refers to "/etc/cron.${type}/". Valid
values are 'd', 'hourly, 'daily', 'weekly', 'monthly' and 'yearly'.

- *Default*: 'daily'
