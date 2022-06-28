define users::remove_users (
  $cronloc  = undef, 
  $mailloc  = undef, 
  $userinfo,
){
  include users
  $users_hash = parsejson($userinfo)
  $user_hash = $users_hash[$name]

  ensure_resource( 'user', $name, { ensure => absent } )

  $real_cronloc = $cronloc ? {
    undef   => $users::cronloc,
    default => $cronloc,
  }

  $real_mailloc = $mailloc ? {
    undef   => $users::mailloc,
    default => $mailloc,
  }

  file { "${real_cronloc}/${name}":
    ensure  =>  absent,
    require =>  User["$name"],
  }
  file { "${real_mailloc}/${name}":
    ensure  =>  absent,
    require =>  User["$name"],
  }
  if $user_hash {
    file { $user_hash['home']:
      ensure  =>  absent,
      force   =>  true,
      require =>  User["$name"],
    }
  }
}
