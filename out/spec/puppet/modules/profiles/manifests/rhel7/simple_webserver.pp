class profiles::rhel7::simple_webserver (
  $firewalld_ports = hiera_array('profiles::rhel7::simple_webserver::firewalld_ports',[]),
  # content_source is the location of the source content to deploy this must
  # follow the same format as any Puppet file resource, e.g. 'puppet://websites/<subfolder>'
  $content_source  = hiera('profiles::rhel7::simple_webserver::content_source'),
  $site_name       = hiera('profiles::rhel7::simple_webserver::site_name'),
) {
  # Including firewalld ensures that the service is restarted if
  # configuration changes.
  include firewalld
  # Install/configure apache override values with automatic parameter lookup
  include apache

  file { "${::fqdn} simple website content (${site_name})":
    ensure  => directory,
    path    => "${apache::docroot}/${site_name}",
    recurse => remote,
    owner   => 'root',
    group   => 'apache',
    mode    => '0640',
    source  => $content_source,
    require => Class['apache'],
  }

  $firewalld_ports_hash = array_to_hash($firewalld_ports)
  create_resources('profiles::firewall_ports',$firewalld_ports_hash)
}
