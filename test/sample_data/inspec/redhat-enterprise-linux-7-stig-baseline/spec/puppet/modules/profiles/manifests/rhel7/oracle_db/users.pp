define profiles::rhel7::oracle_db::users (
  # Hash containing user information
  $user_data,
  $ssh_key_hash,
) {
  $init_this_user = $user_data[$name]
  # If a home directory was specified, we're using it. Otherwise,
  # use the default of '/home/${name}'.
  $home_dir = dig44($init_this_user, ['home'], "/home/${name}") 
  # If a primary GID is specified, use it. Otherwise,
  # use the user's name.
  $primary_group = dig44($init_this_user, ['gid'], $name)
  # Get information on existing users
  $users_hash = parsejson($::local_user_info)
  $exec_path = ['/bin','/usr/bin']

  # Attempt to capture user's information
  $tempuser = dig44($init_this_user, ['tempuser'], 'not_found')
  $tmp_home = dig44($users_hash, [$tempuser,'home'], 'not_found')
  # Ensure 'tempuser' does not exist in the final user attributes
  $this_user = delete($init_this_user,'tempuser')
  if $tmp_home == 'not_found' {
    # Generate SSH keys locally
    exec { "Generate SSH keys for ${name}":
      command => "ssh-keygen -t rsa -b 2048 -f ${home_dir}/.ssh/id_rsa -N ''",
      path    => $exec_path,
      user    => $name,
      group   => $primary_group,
      creates => "${home_dir}/.ssh",
      require => File[$home_dir],
      before  => Profiles::Rhel7::Oracle_db::Add_authorized_keys[$members_with_user],
    }
  # Temporary user specified and exists so copy keys
  } else {
    # Copy SSH keys from temporary users
    exec { "Copy SSH keys for ${name} user":
      command => "cp -r --preserve=mode ${tmp_home}/.ssh ${home_dir} && /usr/bin/chown -R ${name}:${primary_group} ${home_dir}/.ssh",
      path    => $exec_path,
      creates => "${home_dir}/.ssh",
      require => File[$home_dir],
      before  => Profiles::Rhel7::Oracle_db::Add_authorized_keys[$members_with_user],
    } ->
    users::remove_users { $tempuser:
      userinfo => $::local_user_info,
    }
  }

  # Instantiate user
  # See if user already exists if he does we won't reset his password (remove from hash)
  $user_exists = dig44($users_hash, [$name], 'not_found')
  $force_pass = dig44($this_user, ['force_password'], 'not_found')
  $password = dig44($this_user, ['password'], 'not_found')

  # Inclue password if user doesn't exist or if 'force_password'
  # specified
  if $user_exists == 'not_found' or $force_pass == true {
    # Require a password in these cases
    if $password == 'not_found' {
      fail("Password must be specified for user: ${name}")
    }
    # Ensure that 'force_password' is not included in the 
    # user hash
    $this_user_mod = delete($this_user, 'force_password')
  } else {
    $this_user_mod = delete($this_user, 'password')
  }
  $create_user = { "${name}" => $this_user_mod }
  create_resources('user', $create_user, {ensure => present, forcelocal => true, home => $home_dir})

  # Now build/ensure the home directory. We will assume the 
  # base directory exists.
  file { $home_dir:
    ensure  => directory,
    owner   => $name,
    group   => $primary_group,
    require => User[$name]
  }

  # Copy environnment initialization files to home directory
  exec { "Copy /etc/skel to ${home_dir}":
    command => "su -c \"/usr/bin/cp -rT /etc/skel ${home_dir}\" ${name}",
    path    => $exec_path,
    creates => "${home_dir}/.bashrc",
    require => File[$home_dir],
  }

  # Add/modify umask in .bashrc
  exec { "Add umask to ${home_dir}/.bashrc":
    command => "echo 'umask ${profiles::rhel7::oracle_db::umask}' >> ${home_dir}/.bashrc",
    unless  => "grep -qE '^umask .*' ${home_dir}/.bashrc",
    path    => $exec_path,
    require => Exec["Copy /etc/skel to ${home_dir}"],
  } ->
  exec { "Update umask in ${home_dir}/.bashrc":
    command => "sed -i'' 's/^umask .*$/umask ${profiles::rhel7::oracle_db::umask}/g' ${home_dir}/.bashrc",
    unless  => "grep -qE '^umask ${profiles::rhel7::oracle_db::umask}' ${home_dir}/.bashrc",
    path    => $exec_path,
  }

  # Add authorized keys for each cluster host
  $cluster_members = $profiles::rhel7::oracle_db::cluster_members
  $members_with_user = prefix($cluster_members,"${name}@")
  profiles::rhel7::oracle_db::add_authorized_keys{ $members_with_user:
    source_user  => $tempuser,
    ssh_key_hash => $ssh_key_hash,
  }
}
