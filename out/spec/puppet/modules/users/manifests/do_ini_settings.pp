# This defined type handles separating the section from the
# parameter when for ini-style files before passing to 
# do_simple_vars. 
define users::do_ini_settings ( $file, $lens, $set_comment=true ){
  $parts = split($name,':')
  $sect_parm = split($parts[0],'/')
  $section = $sect_parm[0]
  $param = $sect_parm[1]
  $val = $parts[1]

  users::do_simple_vars { "${param}:${val}":
    file        =>  "$file",
    context     =>  "${file}/${section}",
    lens        =>  "$lens",
    set_comment =>  $set_comment,
  }
}
