class autofs::install {
  package { "$autofs::pkg_name":
    ensure  =>  installed,
  }
}

