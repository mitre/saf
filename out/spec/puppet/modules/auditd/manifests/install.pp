class auditd::install {
  package { $auditd::package_name:
    ensure  =>  installed,
    alias   =>  'auditd',
  }
}
