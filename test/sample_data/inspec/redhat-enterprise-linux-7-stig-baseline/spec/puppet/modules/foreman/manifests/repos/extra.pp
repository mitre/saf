# Configure thirdparty repos
class foreman::repos::extra(
  $configure_epel_repo      = $::foreman::configure_epel_repo,
  $configure_scl_repo       = $::foreman::configure_scl_repo,
) {
  $osreleasemajor = regsubst($::operatingsystemrelease, '^(\d+)\..*$', '\1')

  if $configure_epel_repo {
    $epel_gpgkey = $osreleasemajor ? {
      '7'     => 'https://fedoraproject.org/static/352C64E5.txt',
      default => 'https://fedoraproject.org/static/0608B895.txt',
    }
    yumrepo { 'epel':
      descr      => "Extra Packages for Enterprise Linux ${osreleasemajor} - \$basearch",
      mirrorlist => "https://mirrors.fedoraproject.org/metalink?repo=epel-${osreleasemajor}&arch=\$basearch",
      baseurl    => "http://download.fedoraproject.org/pub/epel/${osreleasemajor}/\$basearch",
      enabled    => 1,
      gpgcheck   => 1,
      gpgkey     => $epel_gpgkey,
    }
  }

  if $configure_scl_repo {
    package {'foreman-release-scl':
      ensure => installed,
    }
  }
}
