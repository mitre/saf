class pam::install {
  if $pam::sssd_enabled {
    package { "$pam::oddjob_pkg":
      ensure  =>  installed,
      require => Package["$pam::sssd_pkg"],
      before  => File["${pam::pam_dir}/${pam::pam_local_config}", "${pam::pam_dir}/${pam::pam_remote_config}"]
    }
  }

  package { "$pam::pwquality_pkg":
    ensure  => installed,
    before  => File["${pam::pam_dir}/${pam::pam_local_config}", "${pam::pam_dir}/${pam::pam_remote_config}"]
  }
}
