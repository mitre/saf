define profiles::rhel7::oracle_db::add_authorized_keys (
  $source_user,
  $ssh_key_hash,
) {
  $name_comps = split($name, '@')
  $dest_user = $name_comps[0]
  $hostname = $name_comps[1]

  # If the Puppet run fails here it is most likely because
  # something was invalid with the foreman query.
  if $ssh_key_hash["${hostname}.${::domain}"] == undef {
    notify { "No system information found for ${name}": }
    $results = {}
  } else {
    $fact_value = dig44($ssh_key_hash, ["${hostname}.${::domain}", $profiles::rhel7::oracle_db::user_info_fact_name], 'not_found')
    if $fact_value == 'not_found' {
      fail ( "Fact '${profiles::rhel7::oracle_db::user_info_fact_name}' not found for host ${hostname}" )
    } else {
      $results = parsejson($ssh_key_hash["${hostname}.${::domain}"][$profiles::rhel7::oracle_db::user_info_fact_name])
    }
  }

  # First check if information exists for the temporary user
  if $results[$source_user] {
    $key = $results[$source_user]['key']['value']
    $key_type = $results[$source_user]['key']['type']
  # If the temporary user has already been deleted try the permanent user
  } elsif $results[$dest_user] {
    $key = $results[$dest_user]['key']['value']
    $key_type = $results[$dest_user]['key']['type']
  }

  if $key != undef {
    ssh_authorized_key { $name: 
      user   => $dest_user,
      ensure => present,
      key    => $key,
      type   => $key_type,
    }
  }
}
