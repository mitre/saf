# == Class: users
#
# This class allows for the addition and removal of local user accounts.
# When user accounts are removed cleanup of the user's home directory
# mail archive and crontab is also performed.
#
# This module also allows for addition of custom configuration to user-specific
# system configuration files: login.defs, libuser.conf and useradd.
#
# The module also allows STIG mandated configurations to be applied to the
# above referenced configuration files. STIG settings can also be retroactively
# be applied to existing user accounts and home directories.
#
# === Parameters
#
# [*add_users*]
#   This is a hash mapping a new user with custom settings for this user. The
#   custom settings supplied must match resource parameters for the Puppet
#   'user' resource type. The modules expects this to be a hash so if no 
#   custom settings are required this should be passed as: 
#     {'<username>'=>{}} # Empty options hash.
#
# [*libuser_conf_file*]
#   This is the OS-specific location of the libuser.conf file.
#
# [*libuser_custom_settings*]
#   This is a hash of <setting>=><value> pairs to be added to the libuser.conf
#   file. The libuser.conf file is INI-style and broken into sections. The
#   parameter is expected to be of the form of '<section>/<parameter>'=>'<value>'.
#
# [*login_defs_conf_file*]
#   This is the OS-specific location of the login.defs file.
#
# [*login_defs_custom_settings*]
#   This is a hash of <setting>=><value> pairs to be added to the login.defs
#   file.
#
# [*maintain_homedirs*]
#   This boolean value specifies whether Puppet should maintain STIG-specific
#   permissions on existing interactive user accounts. This setting does not 
#   affect non-login/interactive accounts and does not take effect unless
#   parameter 'stig_enabled' is also set to true. Default: false
#
# [*manage_libuser*]
#   Boolean specifying whether or not to manage the libuser.conf file.
#   Default: true
#
# [*manage_login_defs*]
#   Boolean specifying whether or not to manage the login.defs file.
#   Default: true
#
# [*manage_useradd*]
#   Boolean specifying whether or not to manage the useradd file.
#   Default: true
#
# [*remove_users*]
#   List of users to remove. This is a list of just user account names.
#   There are no other passed values so the assumption is that the user should
#   be completely wiped out. The user's home directory, mail cache and crontab
#   will be removed. If there is any user data needed to be retained do
#   so before adding this user to the list.
#
# [*stig_curr_users*]
#   Boolean specifying whether to retroactively apply STIG mandated configurations
#   to existing local user accounts. This parameter has not affect if 
#   parameter 'stig_enabled' is not also set to true.
#
# [*stig_enabled*]
#   Boolean specifying whether to enable built-in STIG configurations. STIG
#   configurations will be merged with provided custom settings with custom
#   settings overriding STIG configurations.
#
# [*useradd_conf_file*]
#   This is the OS-specific location of the useradd file.
#
# [*useradd_custom_settings*]
#   This is a hash of <setting>=><value> pairs to be added to the useradd file.
#
# === Variables
#
# None
#
# === Facts
#
# [*local_user_info*]
#   This custom fact uses the local passwd database and returns a comma-separated
#   list of '<username>:<homedir>:<primary_gid>' entries. This data is used for 
#   multiple purposes throughout this module. The fact only contains LOCAL, NON-SYSTEM
#   accounts that have a valid LOGIN SHELL (/etc/shells) not including the 'nologin'
#   shell.
#
# === Examples
#
#  class { 'users':
#    stig_enabled => true,
#    remove_users => ['bobama'],
#    libuser_custom_settings => {'import/login_defs' => '/etc/login.defs'},
#  }
#
# === Authors
#
# Author Lesley Kimmel <lesley.j.kimmel@gmail.com>
#
# === Copyright
#
# Copyright 2017 Lesley Kimmel, unless otherwise noted.
#
class users (
  $add_users                  = [],
  $remove_users               = [],
  # Exclude specified users from any modification
  $exclude_users              = [],
  # List of users that are managed by Puppet elsewhere
  $managed_users              = [],
  $mod_curr_users             = false,
  $user_props                 = {},
  $mod_homedirs               = false,
  $homedir_mode               = $users::params::homedir_mode,
  $manage_login_defs          = true,
  $login_defs_custom_settings = {},
  $login_defs_conf_file       = $users::params::login_defs_conf_file,
  $manage_libuser             = true,
  $libuser_custom_settings    = {},
  $libuser_conf_file          = $users::params::libuser_conf_file,
  $manage_useradd             = true,
  $useradd_custom_settings    = {},
  $useradd_conf_file          = $users::params::useradd_conf_file,
  $set_comments               = true,
) inherits users::params {

  $local_users = keys(parsejson($::local_user_info))
  $combined_user_props = merge($users::params::user_defaults,$user_props)

  validate_array($add_users)
  validate_hash($login_defs_custom_settings)
  validate_hash($libuser_custom_settings)
  validate_hash($useradd_custom_settings)
  validate_array($remove_users)
  validate_array($exclude_users)
  validate_array($managed_users)
  validate_bool($mod_homedirs)
  validate_bool($manage_login_defs)
  validate_bool($manage_libuser)
  validate_bool($manage_useradd)
  validate_bool($mod_curr_users)

  $modify_users = delete($local_users, $exclude_users)

  if $mod_curr_users {
    users::add_users { $modify_users:
      user_props =>  $combined_user_props,
    }
  }

  if $mod_homedirs {
    users::mod_homedir { $modify_users:
      new_mode => $homedir_mode,
    }
  }

  # Add users
  if size($add_users) >= 1 {
    # If users are slated to be added and deleted
    # prefer deleted
    $modified_add_users = delete( $add_users, $remove_users )
    users::add_users { $modified_add_users:
      user_props    =>  $combined_user_props,
      homedir_prefix=>  $users::params::homedir_prefix,
    }
  }

  # Remove users
  $cronloc = $users::params::crontab_base
  $mailloc = $users::params::mail_base
  if size($remove_users) >= 1 {
    users::remove_users { $remove_users:
      cronloc  =>  $cronloc,
      mailloc  =>  $mailloc,
      userinfo =>  $::local_user_info,
    }
  }

  contain users::config
}
