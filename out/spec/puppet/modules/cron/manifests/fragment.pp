# == Define: cron::fragment
#
# Manage cron jobs in separate files
#
define cron::fragment (
  $ensure       = 'absent',
  $content      = undef,
  $owner        = 'root',
  $group        = 'root',
  $mode         = 'USE_DEFAULTS',
  $type         = 'daily',
  # deprecated
  $ensure_cron  = undef,
  $cron_content = undef,
) {

  if $ensure_cron != undef {
    notify { '*** DEPRECATION WARNING***: $cron::fragment::ensure_cron was renamed to $ensure. Please update your configuration. Support for $ensure_cron will be removed in the near future!': }
    $ensure_real = $ensure_cron
  } else {
    $ensure_real = $ensure
  }

  if $cron_content != undef {
    notify { '*** DEPRECATION WARNING***: $cron::fragment::cron_content was renamed to $content. Please update your configuration. Support for $cron_content will be removed in the near future!': }
    $content_real = $cron_content
  } else {
    $content_real = $content
  }

  if $mode == 'USE_DEFAULTS' {
    case $type {
      'd': {
        $mode_real = '0644'
      }
      'hourly','daily','weekly','monthly','yearly': {
        $mode_real = '0755'
      }
      default: {
        fail("cron::fragment::type is ${type} and must be d, hourly, daily, monthly, weekly or yearly")
      }
    }
  } else {
    $mode_real = $mode
  }

  include ::cron

  validate_re($ensure_real, '^(absent|file|present)$', "cron::fragment::ensure is ${ensure} and must be absent, file or present")
  if is_string($content_real) == false { fail('cron::fragment::content must be a string') }
  if is_string($owner) == false { fail('cron::fragment::owner must be a string') }
  if is_string($group) == false { fail('cron::fragment::group must be a string') }
  validate_re($mode_real, '^[0-7]{4}$',
    "cron::fragment::mode is <${mode_real}> and must be a valid four digit mode in octal notation.")

  file { "/etc/cron.${type}/${name}":
    ensure  => $ensure_real,
    content => $content_real,
    force   => true,
    owner   => $owner,
    group   => $group,
    mode    => $mode_real,
    require => File[crontab],
  }
}
