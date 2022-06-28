define profiles::build_dir (
  $systemdirs = [],
  $owner   = 'root',
  $group   = 'root',
  $mode    = '0750',
) {
  validate_array($systemdirs)
  # As a safety measure ensure that Puppet never
  # manages the root directory ('/').
  $mod_systemdirs = concat($systemdirs,['/'])

  if ! member($mod_systemdirs, $name) { 

    $var = delete(split($name,'/'),'')

    if size($var) > 1 {
      $var1 = delete_at($var, -1)
      $tmp_path = join($var1,'/')
      $new_path = "/${tmp_path}"
      
      if ! defined(Profiles::Build_dir[$new_path]) {
        profiles::build_dir { $new_path:
          systemdirs => $systemdirs,
          owner   => $owner,
          group   => $group,
          mode    => $mode,
        }
      }
    }

    file { $name:
      ensure => directory,
      owner  => $owner,
      group  => $group,
      mode   => $mode,
    }
  }
}
