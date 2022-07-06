define rsyslog::fragment (
  $confd_dir = $rsyslog::confd_dir,
  $mode      = '0644',
  $content,
) {

  file { "rsyslog - ${name}.conf":
    ensure  =>  file,
    path    =>  "${confd_dir}/${name}.conf",
    owner   =>  "root",
    group   =>  "root",
    mode    =>  $mode,
    content =>  $content,
    require =>  Package["$rsyslog::pkg_name"],
    notify  =>  Service["$rsyslog::svc_name"],
  }
}
