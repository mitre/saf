class yum::install {

  # By default take removal of packages as priority, remove
  # instances of packages to be installed that exist
  # in packages to be removed unless changed by $pkg_priority
  if $yum::pkg_priority == "remove" {
    $packages_to_remove = $yum::remove_pkgs
    $packages_to_install = delete( $yum::install_pkgs, $packages_to_remove )
  } else {
    $packages_to_install = $yum::install_pkgs
    $packages_to_remove = delete( $yum::remove_pkgs, $packages_to_install)
  }

  if size($packages_to_install) > 0 {
    ensure_resource( 'package', $packages_to_install, { ensure => installed } )
  }

  if size($packages_to_remove) > 0 {
    ensure_resource( 'package', $packages_to_remove, { ensure => absent } )
  }
}
