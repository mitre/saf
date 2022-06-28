# Set up the foreman database
class foreman::database {
  if $::foreman::db_manage {
    $db_class = "foreman::database::${::foreman::db_type}"

    $after_db_notify = $::foreman::db_manage_rake ? {
      true    => Foreman_config_entry['db_pending_migration'],
      default => undef,
    }

    class { $db_class:
      notify => $after_db_notify,
    }
  }

  if $::foreman::db_manage_rake {
    validate_string($::foreman::admin_username, $::foreman::admin_password)
    $seed_env = {
      'SEED_ADMIN_USER'       => $::foreman::admin_username,
      'SEED_ADMIN_PASSWORD'   => $::foreman::admin_password,
      'SEED_ADMIN_FIRST_NAME' => $::foreman::admin_first_name,
      'SEED_ADMIN_LAST_NAME'  => $::foreman::admin_last_name,
      'SEED_ADMIN_EMAIL'      => $::foreman::admin_email,
      'SEED_ORGANIZATION'     => $::foreman::initial_organization,
      'SEED_LOCATION'         => $::foreman::initial_location,
    }

    if $::foreman::passenger {
      $foreman_service = Class['apache::service']
    } else {
      $foreman_service = Class['foreman::service']
    }

    foreman_config_entry { 'db_pending_migration':
      value => false,
      dry   => true,
    }
    ~> foreman::rake { 'db:migrate': }
    ~> foreman_config_entry { 'db_pending_seed':
      value  => false,
      dry    => true,
      # to address #7353: settings initialization race condition
      before => $foreman_service,
    }
    ~> foreman::rake { 'db:seed':
      environment => delete_undef_values($seed_env),
    }
    ~> foreman::rake { 'apipie:cache:index':
      timeout => 0,
    }
  }
}
