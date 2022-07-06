define profiles::rhel7::oracle_db::add_host_keys (
  $ssh_key_hash,
) {
  # If the Puppet run fails here it is most likely because
  # something was invalid with the foreman query.
  $results = parsejson($ssh_key_hash[$name][$profiles::rhel7::oracle_db::ssh_host_keys_fact_name])
  if ! $results { fail("No system information found for host: ${hostname}") }

  if has_key($results, 'ssh-rsa') {
    $key_type = 'ssh-rsa'
    $key_value = $results['ssh-rsa']
  } elsif has_key($results, 'ssh-ed25519') {
    $key_type = 'ssh-ed25519'
    $key_value = $results['ssh-ed25519']
  } elsif has_key($results, 'ecdsa-sha2-nistp256') {
    $key_type = 'ecdsa-sha2-nistp256'
    $key_value = $results['ecdsa-sha2-nistp256']
  } else {
    fail("No valid host keys found for host: ${name}")
  }

  sshkey { $name:
    ensure  => present,
    key     => $key_value,
    type    => $key_type,
  }
}
