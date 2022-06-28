# == Class: pam_stig
#
# Full description of class pam_stig here.
#
# === Parameters
#
# Document parameters here.
#
# [*sample_parameter*]
#   Explanation of what this parameter affects and what it defaults to.
#   e.g. "Specify one or more upstream ntp servers as an array."
#
# === Variables
#
# Here you should define a list of variables that this module would require.
#
# [*sample_variable*]
#   Explanation of how this variable affects the funtion of this class and if
#   it has a default. e.g. "The parameter enc_ntp_servers must be set by the
#   External Node Classifier as a comma separated list of hostnames." (Note,
#   global variables should be avoided in favor of class parameters as
#   of Puppet 2.6.)
#
# === Examples
#
#  class { 'pam_stig':
#    servers => [ 'pool.ntp.org', 'ntp.local.company.com' ],
#  }
#
# === Authors
#
# Author Name <author@domain.com>
#
# === Copyright
#
# Copyright 2017 Your name here, unless otherwise noted.
#
class pam_stig {
  $files = ['/tmp/system-auth', '/tmp/password-auth']
  do_pam{$files:}
}

define do_pam {
  file { "${name}-local":
    ensure  =>  file,
    source  =>  "puppet:///modules/pam_stig/pam_default",
    #owner   =>  "root",
    #group   =>  "root",
    mode    =>  0644,
    replace =>  false,
  }

  file { "${name}":
    ensure  =>  link,
    target  =>  "${name}-local",
    require =>  File["${name}-local"],
  }

  augeas { "Configure pam_faillock in ${name}-local":
    incl    =>  "${name}-local",
    lens    =>  'pam.lns',
    changes =>  [
                'set *[type="auth"][module="pam_unix.so"]/control "[success=1 default=bad]"',
                'rm *[type="auth"][module="pam_unix.so"]/argument[.!="try_first_pass"]',
                'set *[type="auth"][module="pam_unix.so"]/argument[.="try_first_pass"] try_first_pass',
                'rm *[type="auth"][module="pam_faillock.so"]',
                'ins 01 after *[type="auth"][module="pam_unix.so"]',
                'set 01/type "auth"',
                'set 01/control "[default=die]"',
                'set 01/module "pam_faillock.so"',
                'set 01/argument[1] "authfail"',
                'ins 02 after 01',
                'set 02/type "auth"',
                'set 02/control "sufficient"',
                'set 02/module "pam_faillock.so"',
                'set 02/argument[1] "authsucc"',
                ],
    onlyif  =>  [
                'match *[preceding-sibling::*[1][type="auth"][module="pam_unix.so"]][module="pam_faillock.so"][argument="authfail"] size == 0',
                'match *[preceding-sibling::*[2][type="auth"][module="pam_unix.so"]][module="pam_faillock.so"][argument="authsucc"] size == 0',
                'match *[type="auth"][module="pam_faillock.so"] size != 2',
                'match *[type="auth"][module="pam_unix.so"][control="[success=1 default=bad]"] size == 0',
                 ],
    require =>  File["${name}-local"];
  } ->

  augeas { "Enforce pam_faillock settings in ${name}-local":
    incl    =>  "${name}-local",
    lens    =>  'pam.lns',
    changes =>  [
                'defvar tnode *[type="auth"][module="pam_faillock.so"][argument[1]="authfail"]',
                'set $tnode/argument[2] "deny=3"',
                'set $tnode/argument[3] "unlock_time=604800"',
                'set $tnode/argument[4] "fail_interval=900"',
                'rm $tnode/argument[position()>4]',
                'defvar tnode *[type="auth"][module="pam_faillock.so"][argument[1]="authsucc"]',
                'set $tnode/argument[2] "deny=3"',
                'set $tnode/argument[3] "unlock_time=604800"',
                'set $tnode/argument[4] "fail_interval=900"',
                'rm $tnode/argument[position()>4]',
                ],
  }
}
