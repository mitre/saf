define users::mod_homedir (
  $new_owner = undef,
  $new_group = undef,
  $new_mode,
) {
  include users

  $user_info = parsejson($::local_user_info)
  $homedir=$user_info[$name]['home']
  $primary_group=$user_info[$name]['group']

  $owner = $new_owner ? {
    undef => $name,
    default => $new_owner
  }

  $group = $new_group ? {
    undef => $primary_group,
    default => $new_group
  }

  $managed_users = $users::managed_users

  # If user managed elsewhere just override properties
  if member($managed_users, $name) {
    File <| path == $homedir |> {
      ensure  => directory,
      recurse => true,
      owner   => $owner,
      group   => $group,
      mode    => $new_mode,
    }
  # Otherwise manage as a new resource
  } else {
    file { $homedir:
      ensure  =>  directory,
      recurse =>  true,
      owner   =>  $owner,
      group   =>  $group,
      mode    =>  $new_mode,
    }
  }
}
