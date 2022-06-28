# Configure settings in Foreman's database
class foreman::settings(
  $email_config_method       = $::foreman::email_config_method,
  $email_delivery_method     = $::foreman::email_delivery_method,
  $email_smtp_address        = $::foreman::email_smtp_address,
  $email_smtp_port           = $::foreman::email_smtp_port,
  $email_smtp_domain         = $::foreman::email_smtp_domain,
  $email_smtp_authentication = $::foreman::email_smtp_authentication,
  $email_smtp_user_name      = $::foreman::email_smtp_user_name,
  $email_smtp_password       = $::foreman::email_smtp_password,
) {
  if $email_config_method == 'database' and !empty($email_delivery_method) {
    foreman_config_entry { 'delivery_method':
      value => $email_delivery_method,
    }

    foreman_config_entry { 'smtp_address':
      value => $email_smtp_address,
    }

    foreman_config_entry { 'smtp_port':
      value => $email_smtp_port,
    }

    foreman_config_entry { 'smtp_domain':
      value => $email_smtp_domain,
    }

    $real_email_smtp_authentication = $email_smtp_authentication ? {
      'none'  => '',
      default => $email_smtp_authentication,
    }
    foreman_config_entry { 'smtp_authentication':
      value => $real_email_smtp_authentication,
    }

    foreman_config_entry { 'smtp_user_name':
      value => $email_smtp_user_name,
    }

    foreman_config_entry { 'smtp_password':
      value => $email_smtp_password,
    }
  }
}
