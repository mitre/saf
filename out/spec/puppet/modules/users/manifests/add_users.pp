define users::add_users (
  $user_props     = {},
  $homedir_prefix = undef,
) {
  $managed_users = $users::managed_users

  if $homedir_prefix {
    $user_home = { 'home' => "${homedir_prefix}/${name}" }
  } else {
    $user_home = {}
  }
  $user_settings = merge($user_props,$user_home)

  # If the user is specified as already managed, just override
  # existing parameters
  if member($managed_users, $name) {
    if $user_settings['home'] {
      User <| name == $name |> {
        home => $user_settings['home'],
      }
    }
    if $user_settings['expiry'] {
      User <| name == $name |> {
        expiry => $user_settings['expiry'],
      }
    }
    if $user_settings['password'] {
      User <| name == $name |> {
        password => $user_settings['password'],
      }
    }
    if $user_settings['shell'] {
      User <| name == $name |> {
        shell => $user_settings['shell'],
      }
    }
    if $user_settings['password_max_age'] {
      User <| name == $name |> {
        password_max_age => $user_settings['password_max_age'],
      }
    }
    if $user_settings['password_min_age'] {
      User <| name == $name |> {
        password_min_age => $user_settings['password_min_age'],
      }
    }
  # Otherwise create a new user resource with the desired
  # settings.
  } else {
    ensure_resource( 'user', $name, $user_settings )
  }
}
