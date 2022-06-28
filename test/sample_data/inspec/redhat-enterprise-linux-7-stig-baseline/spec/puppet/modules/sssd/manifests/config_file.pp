define sssd::config_file (
  $priority,
  $domain       = undef,
  $domain_opts  = {},
  $service_opts = {},
  $label        = $name,
) {
  include sssd
  $confd_dir = $::sssd::confd_dir

  if size($service_opts) == 0 {
    if !$domain or size($domain_opts) == 0 {
      fail("Must provide either a domain with domain options or service options")
    }
  }
  
  validate_hash($domain_opts)
  validate_hash($service_opts)
  
  file { "${confd_dir}/${priority}_${label}.conf":
    ensure  =>  file,
    owner   =>  "root",
    group   =>  "root",
    mode    =>  "0600",
    content =>  template('sssd/config.erb'),
    require =>  Package["$::sssd::sssd_pkg"],
    notify  =>  Service["$::sssd::sssd_svc"],
  }
}
