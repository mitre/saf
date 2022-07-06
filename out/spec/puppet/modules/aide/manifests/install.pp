class aide::install {
  package { "$aide::aide_pkg":
    ensure  =>  installed,
  }
}
