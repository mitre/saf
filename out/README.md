# red-hat-enterprise-linux-7-stig-baseline

InSpec profile to validate the secure configuration of Red Hat Enterprise Linux 7 against [DISA's](https://iase.disa.mil/stigs/Pages/index.aspx) Red Hat Enterprise Linux 7 STIG Version 2 Release 6.

## Getting Started  
It is intended and recommended that InSpec and this profile be run from a __"runner"__ host (such as a DevOps orchestration server, an administrative management system, or a developer's workstation/laptop) against the target remotely over __ssh__.

__For the best security of the runner, always install on the runner the _latest version_ of InSpec and supporting Ruby language components.__ 

Latest versions and installation options are available at the [InSpec](http://inspec.io/) site.

## Tailoring to Your Environment

The following inputs may be configured in an inputs ".yml" file for the profile to run correctly for your specific environment. More information about InSpec inputs can be found in the [InSpec Profile Documentation](https://www.inspec.io/docs/reference/profiles/).

```yaml
# Used by InSpec checks V-71849, V-71855, V-72037
# InSpec Tests that are known to consistently have long run times (V-71849, V-71855, V-72037) can be disabled with this attribute
# Acceptable values: false, true
# (default: false)
disable_slow_controls: 

# Set this to false if your system availability concern is not documented or there is no monitoring of the kernel log
# (default: true)
monitor_kernel_log: 

# Used by InSpec check V-71849
# list of system files that should be allowed to change from an rpm verify point of view
rpm_verify_perms_except: []

# Used by InSpec check V-71855
# list of system files that should be allowed to change from an rpm verify point of view
rpm_verify_integrity_except: []

# Set to 'true' if the login banner message should be enabled
# (default: true)
banner_message_enabled: 

# Used by InSpec check V-72211 (default: false)
# Do NOT set to 'true' UNLESS the server is documented as being used as a log aggregation server. 
log_aggregation_server: 

# Used by InSpec check V-72047 (default: [])
# Known application groups that are allowed to have world-writeable files or directories
application_groups: []

# Used by InSpec check V-72307 (default: false)
# Do NOT set to 'true' UNLESS use of X Windows System is documented and approved. 
x11_enabled: 

# Accounts of known managed users (Array)
user_accounts: []

# System accounts that support approved system activities. (Array) (defaults shown below)
known_system_accounts: []

# User to use to check dconf settings. Nil means to use whatever user is running inspec currently.
dconf_user: ''

# Banner message text for graphical user interface logins.
banner_message_text_gui: ''

# Banner message text for limited-resource graphical user interface logins.
banner_message_text_gui_limited: ''

# Banner message text for command line interface logins.
banner_message_text_cli: ''

# Banner message text for resource-limited command line interface logins.
banner_message_text_cli_limited: ''

# Banner message text for remote access logins.
banner_message_text_ral: ''

# Banner message text for resource-limited remote access logins.
banner_message_text_ral_limited: ''

# The scereensaver lock-delay must be less than or equal to the specified value
lock_delay: 5

# Minimum number of characters that must be different from previous password
difok: 8

# Number of reuse generations
min_reuse_generations: 5

# Number of characters
min_len: 15

# Number of days
days_of_inactivity: 0

# number of unsuccessful attempts
unsuccessful_attempts: 3

# Interval of time in which the consecutive failed logon attempts must occur in order for the account to be locked out (time in seconds)
fail_interval: 900

# Minimum amount of time account must be locked out after failed logins. This attribute should never be set greater than 604800 (time in seconds).
lockout_time: 604800

# Name of tool
file_integrity_tool: ''

# Interval to run the file integrity tool (monthly, weekly, or daily).
file_integrity_interval: ''

# System activity timeout (time in seconds).
system_activity_timeout: 600

# Client alive interval (time in seconds).
client_alive_interval: 600

# V-71965, V-72417, V-72433
# (enabled or disabled)
smart_card_status: "enabled"

# V-72051/V-72209
# The path to the logging package
log_pkg_path: "/etc/rsyslog.conf"

# V-72011, V-72015, V-72017, V-72019, V-72021, V-72023, V-72025
# V-72027, V-72029, V-72031, V-72033, V-72035, V-72037, V-72059
# Users exempt from home directory-based controls in array
# format
exempt_home_users: []

# V-71961
# main grub boot config file
grub_main_cfg: ""

# Main grub boot config file
grub_uefi_main_cfg: ''

# superusers for grub boot ( array )
grub_superusers: ''

# grub boot config files
grub_user_boot_files: []

# V-71963
# superusers for efi boot ( array )
efi_superusers: []

# V-71971
# system accounts that support approved system activities
admin_logins: []

# Maximum number of times to prompt user for new password
max_rety: 3

# The list of packages needed for MFA on RHEL
mfa_pkg_list: []

# V-77819
# should dconf have smart card authentication (e.g., true or false <- no quotes!)
multifactor_enabled: true

# These shells do not allow a user to login
non_interactive_shells: []

# Randomize virtual address space kernel parameter
randomize_va_space: 2

# File systems that don't correspond to removable media
non_removable_media_fs: []

# V-72317
# approved configured tunnels prepended with word 'conn'
# Example: ['conn myTunnel']
approved_tunnels: []

# V-72039
# Is the target expected to be a virtual machine
virtual_machine: false

# maximum number of password retries
max_retry: 3

# Services that firewalld should be configured to allow.
firewalld_services: []

# Hosts that firewalld should be configured to allow.
firewalld_hosts_allow: []

# Hosts that firewalld should be configured to deny.
firewalld_hosts_deny: []

# Ports that firewalld should be configured to allow.
firewalld_ports_allow: []

# Ports that firewalld should be configured to deny.
firewalld_ports_deny: {}

# Allow rules from etc/hosts.allow.
tcpwrappers_allow: {}

# Deny rules from etc/hosts.deny.
tcpwrappers_deny: {}

# Iptable rules that should exist.
iptables_rules: []

# Services that firewalld should be configured to deny.
firewalld_services_deny: {}

# Zones that should be present on the system.
firewalld_zones: []

# The maxium value that can be used for maxlogins.
maxlogins_limit: 10

# Whether an antivirus solution, other than nails, is in use.
custom_antivirus: false

# Description of custom antivirus solution, when in use.
custom_antivirus_description: ''

# Whether an HIPS solution, other than HBSS, is in use.
custom_hips: false

# Description of custom HIPS solution, when in use.
custom_hips_description: ''

# Restrict the number of returned processes to account for invalid inputs, such as nil(~), that will match all processes while allowing for 3rd party software that may spawn multiple similarly named processes.
max_daemon_processes: 1

# It is reasonable and advisable to skip checksum on frequently changing files
aide_exclude_patterns: []

# A list of acceptable terminal multiplexers
terminal_mux_pkgs: []

# Required PAM rules
required_rules: []

# Alternate PAM rules
alternate_rules: []

# is an HBSS with a Device Control Module and a Data Loss Prevention mechanism
data_loss_prevention_installed: true

# An alternate method is used for logs than rsyslog
alternate_logs: false

# is GSSAPI authentication approved
gssapi_approved: true

# Set flag to true if the target system is disconnected
disconnected_system: false
```
## Long Running Controls

There are a few long running controls that take anywhere from 3 minutes to 10 minutes or more to run. In an ongoing or CI/CD pipelne this may not be ideal. We have supplied an 
input (mentioned above in the user-defined inputs) in the profile to allow you to 'skip' these controls to account for these situations.

The input `disable_slow_controls (bool: false)` can be set to `true` or `false` as needed in a <name_of_your_input_file>.yml file.

* `V-71849` (~3 minutes)
* `V-71855` (~3 minutes)
* `V-72037` (10+ minutes)

## Running This Profile Directly from Github

Against a remote target using ssh with escalated privileges (i.e., InSpec installed on a separate runner host)
```bash
# How to run 
inspec exec https://github.com/mitre/redhat-enterprise-linux-7-stig-baseline/archive/master.tar.gz -t ssh://TARGET_USERNAME:TARGET_PASSWORD@TARGET_IP:TARGET_PORT --sudo --sudo-password=<SUDO_PASSWORD_IF_REQUIRED> --input-file <path_to_your_input_file/name_of_your_input_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json> 
```

Against a remote target using a pem key with escalated privileges (i.e., InSpec installed on a separate runner host)
```bash
# How to run 
inspec exec https://github.com/mitre/redhat-enterprise-linux-7-stig-baseline/archive/master.tar.gz -t ssh://TARGET_USERNAME@TARGET_IP:TARGET_PORT --sudo -i <your_PEM_KEY> --input-file <path_to_your_input_file/name_of_your_input_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json>  
```

Against a local Red Hat host with escalated privileges (i.e., InSpec installed on the target)
```bash
# How to run
sudo inspec exec https://github.com/mitre/redhat-enterprise-linux-7-stig-baseline/archive/master.tar.gz --input-file <path_to_your_input_file/name_of_your_input_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json> 
```
### Different Run Options

  [Full exec options](https://docs.chef.io/inspec/cli/#options-3)

## Running This Baseline from a local Archive copy
If your runner is not always expected to have direct access to GitHub, use the following steps to create an archive bundle of this profile and all of its dependent tests:

(Git is required to clone the InSpec profile using the instructions below. Git can be downloaded from the [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) site.) 

```
mkdir profiles
cd profiles
git clone https://github.com/mitre/redhat-enterprise-linux-7-stig-baseline.git
inspec archive redhat-enterprise-linux-7-stig-baseline
sudo inspec exec <name of generated archive> --input-file <path_to_your_input_file/name_of_your_input_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json> 
```

For every successive run, follow these steps to always have the latest version of this baseline and dependent profiles:

```
cd redhat-enterprise-linux-7-stig-baseline
git pull
cd ..
inspec archive redhat-enterprise-linux-7-stig-baseline --overwrite
sudo inspec exec <name of generated archive> --input-file <path_to_your_input_file/name_of_your_input_file.yml> --reporter=cli json:<path_to_your_output_file/name_of_your_output_file.json> 
```

## Using Heimdall for Viewing the JSON Results

![Heimdall Lite 2.0 Demo GIF](https://github.com/mitre/heimdall2/blob/master/apps/frontend/public/heimdall-lite-2.0-demo-5fps.gif)

The JSON results output file can be loaded into __[heimdall-lite](https://heimdall-lite.mitre.org/)__ for a user-interactive, graphical view of the InSpec results. 

The JSON InSpec results file may also be loaded into a __[full heimdall server](https://github.com/mitre/heimdall)__, allowing for additional functionality such as to store and compare multiple profile runs.

## Authors
* Sam Cornwell
* Danny Haynes
* Trevor Vaughan
* Aaron Lippold
* Kyle Fagan
* LJ Kimmel
* KC Linden
* Rony Xavier
* Mohamed El-Sharkawi

## Special Thanks
* The SIMP Project Team
* Eugene Aronne
* Shivani Karikar

## Contributing and Getting Help
To report a bug or feature request, please open an [issue](https://github.com/mitre/redhat-enterprise-linux-7-stig-baseline/issues/new).

### NOTICE

© 2018-2020 The MITRE Corporation.

Approved for Public Release; Distribution Unlimited. Case Number 18-3678.

### NOTICE

MITRE hereby grants express written permission to use, reproduce, distribute, modify, and otherwise leverage this software to the extent permitted by the licensed terms provided in the LICENSE.md file included with this project.

### NOTICE

This software was produced for the U. S. Government under Contract Number HHSM-500-2012-00008I, and is subject to Federal Acquisition Regulation Clause 52.227-14, Rights in Data-General.

No other use other than that granted to the U. S. Government, or to those acting on behalf of the U. S. Government under that Clause is authorized without the express written permission of The MITRE Corporation.

For further information, please contact The MITRE Corporation, Contracts Management Office, 7515 Colshire Drive, McLean, VA 22102-7539, (703) 983-6000.

### NOTICE
DISA STIGs are published by DISA IASE, see: https://iase.disa.mil/Pages/privacy_policy.aspx


# Appendix - (For Developers Interested in Running Hardening Tests):

This repository uses either [Beaker](https://github.com/puppetlabs/beaker) to
run tests or the [KitchenCI](http://kitchen.ci) framework to run tests on the
various profiles. Please see the documentation below on how to use each of the
frameworks.

# Testing with Beaker

To run the tests, perform the following actions:

1. Have Ruby 2.3.0 or later installed
2. Run `bundle install`
3. Run `rake beaker:suites`

### Debugging

If you need to debug your systems, you can run Beaker with a couple of options:

1. Preserve the VM unconditionally

   - `BEAKER_destroy=no rake beaker:suites`

2. Preserve the VM unless the tests pass
   - `BEAKER_destroy=onpass rake beaker:suites`

You can then access the VM by going to the root level of the repository and
navigating to `.vagrant/beaker_vagrant_files/<automatic directory>`.

You should find a `Vagrantfile` at that location and can use any standard
[Vagrant CLI Commands](https://www.vagrantup.com/docs/cli/).

The most useful of these will be `vagrant status` and `vagrant ssh <vm name>`.

## Test Layout

The tests are housed under the `spec/acceptance` directory and use the
profiles in `spec/fixtures/inspec_profiles` during testing.

# Testing with Kitchen

## Dependencies

- Ruby 2.3.0 or later
- [Virtualbox](https://www.virtualbox.org)
- [Vagrant](https://www.vagrantup.com)

#### _Notes to Windows Users_

1. An installation of ChefDK may generate conflicts when combined with the
   installed kitchen gems. **Recommend NOT installing ChefDK before testing
   with this repo.**

2. If you run into errors when running `bundle install`, use the following
   commands to install gems:

- `gem install kitchen-puppet`
- `gem install librarian-puppet`
- `gem install kitchen-vagrant`

3. If the tests are not found when running `kitchen verify`, open
   `.kitchen.yml` and consult `inspec_tests` under the `suites` section.

4) You may also experience an error when running `kitchen converge` where a
   folder is unable to be created due to the length of the path. In this case,
   you may need to edit a registry key as explained
   [here](https://www.howtogeek.com/266621/how-to-make-windows-10-accept-file-paths-over-260-characters/).

## Setting up your box

1. Clone the repo via `git clone -b dev https://github.com/simp/inspec_profiles.git`
2. cd to `inspec_profiles`
3. Run `bundle install`
4. Run `kitchen list` - you should see the following choice:
   - `default-centos-7`
5. Run `kitchen converge default-centos-7`
6. Run `kitchen list` - your should see your host with status "converged"

## Validating your box

**Note:** Once the open issues are resolved in InSpec and kitchen-inspec these
steps will not really be needed but for now we have to do a few things a bit
more manually. Once resolved fully, you will only need to run `kitchen verify (machine name)` and everything will be taken care of.

### In the 'inspec_profiles' dir ( manually )

1. cd `.kitchen/`
2. vi default-centos-7.yml
3. copy the `ssh_key:` value for later
4. note the mapped port value ( usually `2222`) and use in the next step

### In the 'inspec_profiles' dir

1. On the terminal: `export SSH_KEY=(value from before)`
2. cd to `inspec_profiles`

   - (optional) run an `inspec check`, and
     ensure there are no errors in the baseline.

3. run: `inspec exec -i $SSH_KEY -t ssh://vagrant@127.0.0.1:2222 ( or the port mapped from step '4' above )`
   - (optional) `inspec exec controls/V-#####
   - -i \$SSH_KEY -t
     ssh://vagrant@127.0.0.1:2222` to just test a single control
   - (optional) `inspec exec -i $SSH_KEY --controls=V-#####,V-##### -t ssh://vagrant@127.0.0.1:2222` to just test a
     small set of controls

# Hardening Development

Included in this repository are testing scripts which allow you to run the profile using Vagrant or EC2 VMs. You can choose which environment your VMs are run in by passing the appropriate test-kitchen `yml` file to your `KITCHEN_LOCAL_YAML` environment variable. All of the commands below use the `kitchen.vagrant.yml` file as an example, however a `kitchen.ec2.yaml` is also available in the repository and can be substituted below to run the tests in EC2.

- Making Changes and Testing

  - run `CHEF_LICENSE=accept KITCHEN_LOCAL_YAML=kitchen.vagrant.yml kitchen converge (machine name)` - runs any changes to your hardening scripts
  - run `kitchen verify (machine name)` - runs the inspec tests

- Starting Clean:
  - run `CHEF_LICENSE=accept KITCHEN_LOCAL_YAML=kitchen.vagrant.yml kitchen destroy (machine name)` kitchen will drop your box and you can start clean
- Going through the entire process ( create, build, configure, verify, destroy )
  - run `CHEF_LICENSE=accept KITCHEN_LOCAL_YAML=kitchen.vagrant.yml kitchen test (machine name)` or to test all defined machines `kitchen test`
- Just running the validation scripts
  - run `CHEF_LICENSE=accept KITCHEN_LOCAL_YAML=kitchen.vagrant.yml kitchen verify (machine name)`
- just run one or more controls in the validation
  - edit the .kitchen.yml file in the `controls:` section add the `control id(s)` to the list

