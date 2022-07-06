class yum::config {

  $yum_settings = join_keys_to_values( $yum::custom_settings, ':' )

  yum::do_yum_conf { $yum_settings:
    file         =>  "$yum::yum_conf",
    context      =>  "${yum::yum_conf}/main",
    lens         =>  'yum.lns',
    set_comment  =>  $yum::set_comments,   
  }
}
