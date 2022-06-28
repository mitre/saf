# == Class: cron
#
# This module manages cron
#
class cron (
  $package_ensure        = 'installed',
  $package_name          = 'USE_DEFAULTS',
  $crontab_path          = '/etc/crontab',
  $crontab_owner         = 'root',
  $crontab_group         = 'root',
  $crontab_mode          = '0644',
  $cron_allow            = 'absent',
  $cron_deny             = 'present',
  $cron_allow_path       = '/etc/cron.allow',
  $cron_allow_owner      = 'root',
  $cron_allow_group      = 'root',
  $cron_allow_mode       = '0644',
  $cron_deny_path        = '/etc/cron.deny',
  $cron_deny_owner       = 'root',
  $cron_deny_group       = 'root',
  $cron_deny_mode        = '0644',
  $cron_d_path           = '/etc/cron.d',
  $cron_hourly_path      = '/etc/cron.hourly',
  $cron_daily_path       = '/etc/cron.daily',
  $cron_weekly_path      = '/etc/cron.weekly',
  $cron_monthly_path     = '/etc/cron.monthly',
  $cron_dir_owner        = 'root',
  $cron_dir_group        = 'root',
  $cron_dir_mode         = '0755',
  $cron_files            = undef,
  $cron_allow_users      = undef,
  $cron_deny_users       = undef,
  $crontab_vars          = undef,
  $crontab_tasks         = undef,
  $periodic_jobs_content = undef,
  $periodic_jobs_manage  = true,
  $service_enable        = true,
  $service_ensure        = 'running',
  $service_name          = 'USE_DEFAULTS',
  # deprecated
  $enable_cron           = undef,
  $ensure_state          = undef,
) {

  if $enable_cron != undef {
    notify { '*** DEPRECATION WARNING***: $enable_cron was renamed to $service_enable. Please update your configuration. Support for $enable_cron will be removed in the near future!': }
    $service_enable_real = $enable_cron
  } else {
    $service_enable_real = $service_enable
  }

  if $ensure_state != undef {
    notify { '*** DEPRECATION WARNING***: $ensure_state was renamed to $service_ensure. Please update your configuration. Support for $ensure_state will be removed in the near future!': }
    $service_ensure_real = $ensure_state
  } else {
    $service_ensure_real = $service_ensure
  }

  case $::osfamily {
    'Debian': {
      $package_name_default = 'cron'
      $service_name_default = 'cron'
      $periodic_jobs_content_default = []
    }
    'Suse': {
      $periodic_jobs_content_default = [
        '#',
        '# check scripts in cron.hourly, cron.daily, cron.weekly, and cron.monthly',
        '#',
        '-*/15 * * * *   root  test -x /usr/lib/cron/run-crons && /usr/lib/cron/run-crons >/dev/null 2>&1',
      ]
      if $::operatingsystemrelease =~ /^12\./ {
        $package_name_default = 'cronie'
        $service_name_default = 'cron'
      } else {
        $package_name_default = 'cron'
        $service_name_default = 'cron'
      }
    }
    'RedHat': {
      $package_name_default = 'crontabs'
      $service_name_default = 'crond'
      case $::operatingsystemrelease {
        /^5\./: {
          $periodic_jobs_content_default = [
            '# run-parts',
            "01 * * * * root run-parts ${cron_hourly_path}",
            "02 4 * * * root run-parts ${cron_daily_path}",
            "22 4 * * 0 root run-parts ${cron_weekly_path}",
            "42 4 1 * * root run-parts ${cron_monthly_path}",
          ]
        }
        default: {
          $periodic_jobs_content_default = []
        }
      }
    }
    default: {
      fail("cron supports osfamilies RedHat, Suse and Ubuntu. Detected osfamily is <${::osfamily}>.")
    }
  }

  if $package_name == 'USE_DEFAULTS' {
    $package_name_array = $package_name_default
  } else {
    case type3x($package_name) {
      'array': {
        $package_name_array = $package_name
      }
      'string': {
        $package_name_array = any2array($package_name)
      }
      default: {
        fail('cron::package_name is not a string nor an array.')
      }
    }
  }

  $periodic_jobs_manage_bool = str2bool($periodic_jobs_manage)

  if $periodic_jobs_manage_bool == true {
    $periodic_jobs_content_real = $periodic_jobs_content ? {
      undef   => $periodic_jobs_content_default,
      default => $periodic_jobs_content,
    }
    case type3x($periodic_jobs_content_real) {
      'array':  { $periodic_jobs_content_array = $periodic_jobs_content_real }
      'string': { $periodic_jobs_content_array = any2array($periodic_jobs_content_real) }
      default:  { fail('cron::periodic_jobs_content is not a string nor an array.') }
    }
  }

  if $service_name == 'USE_DEFAULTS' {
    $service_name_real = $service_name_default
  } else {
    $service_name_real = $service_name
  }

  # Validation
  validate_re($service_ensure_real, '^(running)|(stopped)$', "cron::service_ensure is <${service_ensure_real}> and must be running or stopped")
  validate_re($package_ensure, '^(present)|(installed)|(absent)$', "cron::package_ensure is <${package_ensure}> and must be absent, present or installed")
  validate_re($cron_allow, '^(absent|file|present)$', "cron::cron_allow is <${cron_allow}> and must be absent, file or present")
  validate_re($cron_deny, '^(absent|file|present)$', "cron::cron_deny is <${cron_deny}> and must be absent, file or present")

  case type3x($service_enable_real) {
    'string': {
      validate_re($service_enable_real, '^(true|false)$', "cron::service_enable is <${service_enable_real}> and must be true or false.")
      $service_enable_bool = str2bool($service_enable_real)
    }
    'boolean': {
      $service_enable_bool = $service_enable_real
    }
    default: {
      fail("cron::service_enable is <${service_enable_real}> and must be true or false.")
    }
  }
  if $cron_allow_users != undef {
    validate_array($cron_allow_users)
    cron::allow_deny_fragment { 'Initial cron.allow users':
      type  => 'allow',
      users => $cron_allow_users,
    }
  }
  if $cron_deny_users != undef {
    validate_array($cron_deny_users)
    cron::allow_deny_fragment { 'Initial cron.deny users':
      type  => 'deny',
      users => $cron_deny_users,
    }
  }

  if $crontab_tasks != undef {
    validate_hash($crontab_tasks)
  }

  if $crontab_vars != undef {
    validate_hash($crontab_vars)
  }

  if $cron_files != undef {
    validate_hash($cron_files)
    create_resources(cron::fragment,$cron_files)
  }

  validate_absolute_path($cron_allow_path)
  validate_absolute_path($cron_deny_path)
  validate_absolute_path($crontab_path)
  validate_absolute_path($cron_d_path)
  validate_absolute_path($cron_hourly_path)
  validate_absolute_path($cron_daily_path)
  validate_absolute_path($cron_weekly_path)
  validate_absolute_path($cron_monthly_path)

  if is_string($cron_allow_group) == false { fail('cron::cron_allow_group must be a string') }
  if is_string($cron_allow_owner) == false { fail('cron::cron_allow_owner must be a string') }
  if is_string($cron_deny_group)  == false { fail('cron::cron_deny_group must be a string') }
  if is_string($cron_deny_owner)  == false { fail('cron::cron_deny_owner must be a string') }
  if is_string($cron_dir_group)   == false { fail('cron::cron_dir_group must be a string') }
  if is_string($cron_dir_owner)   == false { fail('cron::cron_dir_owner must be a string') }
  if is_string($crontab_group)    == false { fail('cron::crontab_group must be a string') }
  if is_string($crontab_owner)    == false { fail('cron::crontab_owner must be a string') }

  validate_re($crontab_mode, '^[0-7]{4}$',
    "cron::crontab_mode is <${crontab_mode}> and must be a valid four digit mode in octal notation.")
  validate_re($cron_dir_mode, '^[0-7]{4}$',
    "cron::cron_dir_mode is <${cron_dir_mode}> and must be a valid four digit mode in octal notation.")
  validate_re($cron_allow_mode, '^[0-7]{4}$',
    "cron::cron_allow_mode is <${cron_allow_mode}> and must be a valid four digit mode in octal notation.")
  validate_re($cron_deny_mode, '^[0-7]{4}$',
    "cron::cron_deny_mode is <${cron_deny_mode}> and must be a valid four digit mode in octal notation.")

  # End of validation

  # Initialize cron.allow
  concat { $cron_allow_path:
    ensure  => $cron_allow,
    owner   => $cron_allow_owner,
    group   => $cron_allow_group,
    mode    => $cron_allow_mode,
  }
  concat::fragment { "${cron_allow_path} header":
    target => $cron_allow_path,
    order  => '01',
    content => template('cron/_cron_allow_deny_header.erb'),
  }

  # Initialize cron.deny
  concat { $cron_deny_path:
    ensure  => $cron_deny,
    owner   => $cron_deny_owner,
    group   => $cron_deny_group,
    mode    => $cron_deny_mode,
  }
  concat::fragment { "${cron_deny_path} header":
    target => $cron_deny_path,
    order  => '01',
    content => template('cron/_cron_allow_deny_header.erb'),
  }

  package { $package_name_array:
    ensure => $package_ensure,
    before => [
      Concat[$cron_allow_path],
      Concat[$cron_deny_path],
      File[crontab],
      File[cron_d],
      File[cron_hourly],
      File[cron_daily],
      File[cron_weekly],
      File[cron_monthly],
    ],
  }

  file { 'crontab':
    ensure  => file,
    path    => $crontab_path,
    owner   => $crontab_owner,
    group   => $crontab_group,
    mode    => $crontab_mode,
    content => template('cron/crontab.erb'),
  }

  file { 'cron_d':
    ensure => directory,
    path   => $cron_d_path,
    owner  => $cron_dir_owner,
    group  => $cron_dir_group,
    mode   => $cron_dir_mode,
  }

  file { 'cron_hourly':
    ensure => directory,
    path   => $cron_hourly_path,
    owner  => $cron_dir_owner,
    group  => $cron_dir_group,
    mode   => $cron_dir_mode,
  }

  file { 'cron_daily':
    ensure => directory,
    path   => $cron_daily_path,
    owner  => $cron_dir_owner,
    group  => $cron_dir_group,
    mode   => $cron_dir_mode,
  }

  file { 'cron_weekly':
    ensure => directory,
    path   => $cron_weekly_path,
    owner  => $cron_dir_owner,
    group  => $cron_dir_group,
    mode   => $cron_dir_mode,
  }

  file { 'cron_monthly':
    ensure => directory,
    path   => $cron_monthly_path,
    owner  => $cron_dir_owner,
    group  => $cron_dir_group,
    mode   => $cron_dir_mode,
  }

  service { 'cron':
    ensure    => $service_ensure_real,
    enable    => $service_enable_bool,
    name      => $service_name_real,
    require   => File['crontab'],
    subscribe => File['crontab'],
  }
}
