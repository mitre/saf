define pam::pam_file (
  $ensure  = 'file',
  $pam_dir = undef,
  $lines,
) {
  include pam

  validate_re($ensure, ['file','absent'])

  $real_pam_dir = $pam_dir ? {
    undef   =>  $pam::pam_dir,
    default =>  $pam_dir,
  }

  file { "${real_pam_dir}/${name}":
    ensure  =>  $ensure,
    owner   =>  'root',
    group   =>  'root',
    mode    =>  '0644',
    content =>  template('pam/pam_file.erb'),
  }
}
