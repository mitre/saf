class profiles::rhel7::oracle_db::os_config
{
  $exec_path = ['/bin', '/usr/bin', '/sbin', '/usr/sbin']

  # Create groups
  create_resources('group', $profiles::rhel7::oracle_db::groups, {ensure => present, forcelocal => true})

  # Get Foreman query results from main class
  $foreman_user_info = $profiles::rhel7::oracle_db::foreman_user_info
  $foreman_host_keys = $profiles::rhel7::oracle_db::foreman_host_keys

  # Create users
  $all_users = merge($profiles::rhel7::oracle_db::oracle_owner,
                     $profiles::rhel7::oracle_db::grid_owner,
                    )
  $usernames = keys($all_users)
  profiles::rhel7::oracle_db::users { $usernames:
    user_data    => $all_users,
    ssh_key_hash => $foreman_user_info['results'],
  }

  # Add users to cron.allow
  # If cron.allow is enabled in another module we will be added to it.
  # Otherwise, it will be absent, by default, and we will still be allowed
  # cron access. We can ensure cron.allow is present by specifying 
  # "cron::cron_allow: 'present'" in Hiera.
  cron::allow_deny_fragment{ 'Oracle application accounts':
    type  => 'allow',
    users => $usernames,
  }

  Group[keys($profiles::rhel7::oracle_db::groups)] -> User[$usernames]

  # Install required packages
  profiles::packages { $profiles::rhel7::oracle_db::required_packages:
    package_list => $profiles::rhel7::oracle_db::required_packages,
  }

  # Ensure Transparent Hugepages remain disabled
  exec { 'Disable Transparent Hugepages':
    command => 'sed -i"" "s/\(GRUB_CMDLINE_LINUX=.*\)\"$/\1 transparent_hugepage=never\"/g" /etc/default/grub && grub2-mkconfig -o /boot/grub2/grub.cfg',
    path    => $exec_path,
    unless  => 'grep GRUB_CMDLINE_LINUX /etc/default/grub | grep -q "transparent_hugepage=never"',
  }

  # Determine Hugepages related settings
  $min_hp = $::minimum_hugepages ? {
    undef   => $profiles::rhel7::oracle_db::minimum_hugepages + 0,
    default => $::minimum_hugepages + 0,
  }

  if $min_hp != 0 {
    $pages = [$min_hp, $::hugepages+0, $::current_hugepages+0]
    # Sort page counts to get largest - never decrease
    $sorted_pages = sort($pages)
    $num_pages = $sorted_pages[-1]
    $tmp_memlock = 0.9 * ($::memorysize_mb+0) * 1024
    $real_shmmax = $num_pages * ($::hugepage_size_kb+0) * 1024
    $real_shmall = ( $real_shmmax + (($::dev_shm_size_kb+0) * 1024) ) / ($::sys_pagesize + 0)
  } else {
    $num_pages = 0
    $tmp_memlock = $profiles::rhel7::oracle_db::minimum_memlock
    $real_shmall = $::shmall
    $real_shmmax = $::shmmax
  }
  $memlock = inline_template('<%= @tmp_memlock.to_i %>')

  # Create sysctl file
  $shmall = { 'kernel.shmall'   => inline_template('<%= @real_shmall.to_i %>') }
  $shmmax = { 'kernel.shmmax'   => inline_template('<%= @real_shmmax.to_i %>') }
  $new_hp = { 'vm.nr_hugepages' => $num_pages }
  $new_settings = merge($shmall, $shmmax, $new_hp, $profiles::rhel7::oracle_db::kernel_settings)

  sysctl::sysctl_file { $profiles::rhel7::oracle_db::sysctl_name:
    priority => $profiles::rhel7::oracle_db::sysctl_priority,
    settings => $new_settings,
  }

  # Add mounts
  create_resources('mount',$profiles::rhel7::oracle_db::fs_mounts, {pass => 0, dump => 0})

  # Set system limits
  # If memlock specified directly use those values
  $memlock_vals = grep($profiles::rhel7::oracle_db::limits, 'memlock')
  if size($memlock_vals) > 0 {
    $use_limits = $profiles::rhel7::oracle_db::limits
  } else {
    $soft_memlock = "${profiles::rhel7::oracle_db::oracle_owner_name}:soft:memlock:${memlock}"
    $hard_memlock = "${profiles::rhel7::oracle_db::oracle_owner_name}:hard:memlock:${memlock}"
    $use_limits = concat($profiles::rhel7::oracle_db::limits, [$soft_memlock, $hard_memlock])
  }

  pam::limits_fragment { $use_limits:
    shortname   => 'oracle',
    set_comment => false,
  }

  # Add host keys for all nodes
  $hosts = keys($foreman_host_keys['results'])
  profiles::rhel7::oracle_db::add_host_keys { $hosts:
    ssh_key_hash => $foreman_host_keys['results'],
  }

  # Create required directories under /u01
  create_resources('profiles::build_dir',$profiles::rhel7::oracle_db::u01_dirs,{mode=>'0775',systemdirs=>['/u01']})

  # If we are preconfiguring only we will build out the
  # remainder of our directory structure to support installation
  # We also want to pre-build our directories if we are member nodes
  # to ensure that we are ready to accept deployment files pushed from
  # the master when installation begins.
  if $profiles::rhel7::oracle_db::preconfigure_only == true or $::hostname != $::cluster_master {
    $gridowner_data = $profiles::rhel7::oracle_db::grid_owner
    $gridowner_name = $profiles::rhel7::oracle_db::grid_owner_name
    $gridgroup = dig44($gridowner_data, [$gridowner_name, 'gid'], 'not_found')
    $real_gridgroup = $gridgroup ? {
      'not_found' => $gridowner_name,
      default     => $gridgroup
    }

    db_directory_structure { 'Precreate Oracle Grid directory structure':
      ensure            => present,
      oracle_base_dir   => $profiles::rhel7::oracle_db::grid_base,
      oracle_home_dir   => $profiles::rhel7::oracle_db::grid_home,
      ora_inventory_dir => $profiles::rhel7::oracle_db::ora_inventory,
      download_dir      => $profiles::rhel7::oracle_db::software_dir,
      os_user           => $gridowner_name,
      os_group          => $real_gridgroup,
      require           => User[$gridowner_name],
    }

    $dbowner_data = $profiles::rhel7::oracle_db::oracle_owner
    $dbowner_name = $profiles::rhel7::oracle_db::oracle_owner_name
    $dbgroup = dig44($dbowner_data, [$dbowner_name, 'gid'], 'not_found')
    $real_dbgroup = $dbgroup ? {
      'not_found' => $dbowner_name,
      default     => $dbgroup
    }

    db_directory_structure { 'Precreate Oracle DB directory structure':
      ensure            => present,
      oracle_base_dir   => $profiles::rhel7::oracle_db::oracle_base,
      ora_inventory_dir => $profiles::rhel7::oracle_db::ora_inventory,
      download_dir      => $profiles::rhel7::oracle_db::software_dir,
      os_user           => $dbowner_name,
      os_group          => $real_dbgroup,
      require           => User[$dbowner_name],
    }
  }
}
