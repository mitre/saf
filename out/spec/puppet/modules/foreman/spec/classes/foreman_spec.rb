# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman' do
  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let :facts do facts end

      it { is_expected.to compile.with_all_deps }
      it { should contain_class('foreman::repo').that_notifies('Class[foreman::install]') }
      it { should contain_class('foreman::install') }
      it do
        is_expected.to contain_class('foreman::config').that_notifies(
          ['Class[foreman::database]', 'Class[foreman::service]']
        )
      end
      it { should contain_class('foreman::database') }
      it { should contain_class('foreman::service') }
      it { should contain_class('foreman::settings').that_requires('Class[foreman::database]') }

      describe 'with foreman::cli' do
        let :pre_condition do
          "class { 'foreman': }
           class { 'foreman::cli': }"
        end

        it { is_expected.to compile.with_all_deps }
        it { should contain_package('foreman-cli').that_subscribes_to('Class[foreman::repo]') }
      end

      describe 'with foreman::providers' do
        let :pre_condition do
          "class { 'foreman': }
           class { 'foreman::providers':
             apipie_bindings => true,
             apipie_bindings_package => 'apipie-bindings',
           }"
        end

        it { is_expected.to compile.with_all_deps }
        it { should contain_package('apipie-bindings').that_subscribes_to('Class[foreman::repo]') }
      end

      describe 'with all parameters' do
        let :params do {
          :foreman_url               => 'http://localhost',
          :puppetrun                 => false,
          :unattended                => true,
          :authentication            => true,
          :passenger                 => true,
          :passenger_ruby            => '/usr/bin/ruby',
          :passenger_ruby_package    => 'ruby-gem-passenger',
          :plugin_prefix             => 'ruby-foreman',
          :use_vhost                 => true,
          :servername                => 'localhost',
          :serveraliases             => ['foreman'],
          :ssl                       => true,
          :custom_repo               => false,
          :repo                      => 'nightly',
          :configure_epel_repo       => true,
          :configure_scl_repo        => false,
          :selinux                   => true,
          :gpgcheck                  => true,
          :version                   => '1.12',
          :plugin_version            => 'installed',
          :db_manage                 => true,
          :db_type                   => 'postgresql',
          :db_adapter                => 'UNSET',
          :db_host                   => 'UNSET',
          :db_port                   => 'UNSET',
          :db_database               => 'UNSET',
          :db_username               => 'foreman',
          :db_password               => 'secret',
          :db_sslmode                => 'UNSET',
          :db_pool                   => 5,
          :db_manage_rake            => true,
          :app_root                  => '/usr/share/foreman',
          :manage_user               => false,
          :user                      => 'foreman',
          :group                     => 'foreman',
          :user_groups               => ['adm', 'wheel'],
          :rails_env                 => 'production',
          :puppet_home               => '/var/lib/puppet',
          :puppet_ssldir             => '/var/lib/puppet/ssl',
          :locations_enabled         => false,
          :organizations_enabled     => true,
          :passenger_interface       => 'lo0',
          :vhost_priority            => '5',
          :server_port               => 80,
          :server_ssl_port           => 443,
          :server_ssl_ca             => '/etc/ssl/certs/ca.pem',
          :server_ssl_chain          => '/etc/ssl/certs/ca.pem',
          :server_ssl_cert           => '/etc/ssl/certs/snakeoil.pem',
          :server_ssl_certs_dir      => '/etc/ssl/certs/',
          :server_ssl_key            => '/etc/ssl/private/snakeoil.pem',
          :server_ssl_crl            => '/etc/ssl/certs/ca/crl.pem',
          :client_ssl_ca             => '/etc/ssl/certs/ca.pem',
          :client_ssl_cert           => '/etc/ssl/certs/snakeoil.pem',
          :client_ssl_key            => '/etc/ssl/private/key.pem',
          :keepalive                 => true,
          :max_keepalive_requests    => '300',
          :keepalive_timeout         => '5',
          :oauth_active              => true,
          :oauth_map_users           => false,
          :oauth_consumer_key        => 'random',
          :oauth_consumer_secret     => 'random',
          :passenger_prestart        => false,
          :passenger_min_instances   => 3,
          :passenger_start_timeout   => 20,
          :admin_username            => 'admin',
          :admin_password            => 'secret',
          :admin_first_name          => 'Alice',
          :admin_last_name           => 'Bob',
          :admin_email               => 'alice@bob.com',
          :initial_organization      => 'acme',
          :initial_location          => 'acme',
          :ipa_authentication        => false,
          :http_keytab               => '/etc/httpd/conf.keytab',
          :pam_service               => 'foreman',
          :ipa_manage_sssd           => true,
          :websockets_encrypt        => true,
          :websockets_ssl_key        => '/etc/ssl/private/snakeoil.pem',
          :websockets_ssl_cert       => '/etc/ssl/certs/snakeoil.pem',
          :logging_level             => 'info',
          :loggers                   => {},
          :email_conf                => 'email.yaml',
          :email_source              => 'email.yaml.erb',
          :email_delivery_method     => 'sendmail',
          :email_smtp_address        => 'alice@bob.com',
          :email_smtp_port           => 25,
          :email_smtp_domain         => 'example.com',
          :email_smtp_authentication => 'none',
          :email_smtp_user_name      => 'root',
          :email_smtp_password       => 'secret',
        }
        end

        it { is_expected.to compile.with_all_deps }
      end
    end
  end
end
