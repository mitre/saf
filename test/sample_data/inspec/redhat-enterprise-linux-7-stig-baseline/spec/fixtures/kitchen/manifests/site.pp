package { 'screen':
  ensure => 'installed',
  tag => 'V-71897'
}

Package {
  ensure => 'installed'
}
$mfa = ['esc','pam_pkcs11','authconfig-gtk']
package {
  $mfa: tag => 'V-72417'
}

sysctl { 'net.ipv4.conf.all.accept_redirects':
  ensure => present,
  value  => '0',
  tag => 'V-73175'
}

sysctl { 'net.ipv6.conf.all.accept_source_route':
  ensure => present,
  value  => '0',
  tag => 'V-72319'
}

package { 'sssd':
  ensure => 'installed',
  tag => 'V-72427'
}
