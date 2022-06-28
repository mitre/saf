class vmware_gugent::install {
  package { "$vmware_gugent::pkg_name":
    ensure  =>  $vmware_gugent::ensure,
  }
}
