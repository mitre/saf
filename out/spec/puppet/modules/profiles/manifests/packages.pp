define profiles::packages (
  $package_list = undef,
) {
  if is_array($package_list) {
    $prev = index_of($package_list,$name) - 1
    if $prev >= 0 {
      $requires = Package[$package_list[$prev]]
    } else {
      $requires = undef
    }
  } else {
    $requires = undef
  }

  #if ! defined(Package[$name]) {
  package { $name:
    ensure  => installed,
    require => $requires,
  }
  #}
}
