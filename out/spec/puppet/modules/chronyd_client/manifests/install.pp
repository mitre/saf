class chronyd_client::install {
  $pkg_ensure = $chronyd_client::ensure ? {
    true  => 'installed',
    false => 'absent'
  }

  package { "$chronyd_client::pkg_name":
    ensure  =>  $pkg_ensure,
  }
}
