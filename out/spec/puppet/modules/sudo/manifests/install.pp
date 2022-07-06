class sudo::install {
  package { "$sudo::sudo_pkg":
    ensure  =>  installed,
  }

  package { "$sudo::lsb_pkg":
    ensure  =>  installed,
  }
}
