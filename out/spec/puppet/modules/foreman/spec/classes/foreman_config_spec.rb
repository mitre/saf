# -*- encoding : utf-8 -*-
require 'spec_helper'


describe 'foreman::config' do
  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let :facts do facts end

      describe 'without parameters' do
        let :pre_condition do
          "class {'foreman':}"
        end

        it 'should set up the config' do
          should contain_concat__fragment('foreman_settings+01-header.yaml').
            with_content(/^:unattended:\s*true$/).
            with_content(/^:login:\s*true$/).
            with_content(/^:require_ssl:\s*true$/).
            with_content(/^:locations_enabled:\s*false$/).
            with_content(/^:organizations_enabled:\s*false$/).
            with_content(/^:puppetrun:\s*false$/).
            with_content(/^:puppetssldir:\s*\/var\/lib\/puppet\/ssl$/).
            with_content(/^:oauth_active:\s*true$/).
            with_content(/^:oauth_map_users:\s*false$/).
            with_content(/^:oauth_consumer_key:\s*\w+$/).
            with_content(/^:oauth_consumer_secret:\s*\w+$/).
            with_content(/^:websockets_encrypt:\s*on$/).
            with_content(%r{^:ssl_certificate:\s*/var/lib/puppet/ssl/certs/foo\.example\.com\.pem$}).
            with_content(%r{^:ssl_ca_file:\s*/var/lib/puppet/ssl/certs/ca.pem$}).
            with_content(%r{^:ssl_priv_key:\s*/var/lib/puppet/ssl/private_keys/foo\.example\.com\.pem$}).
            with_content(/^:logging:\n\s*:level:\s*info$/).
            with({})

          should contain_concat('/etc/foreman/settings.yaml').with({
            'owner'   => 'root',
            'group'   => 'foreman',
            'mode'    => '0640',
          })
        end

        it 'should configure the database' do
          should contain_file('/etc/foreman/database.yml').with({
            'owner'   => 'root',
            'group'   => 'foreman',
            'mode'    => '0640',
            'content' => /adapter: postgresql/,
          })
        end

        it { should_not contain_file('/etc/foreman/email.yaml') }

        case facts[:osfamily]
        when 'RedHat'
          it 'should set the defaults file' do
            should contain_file('/etc/sysconfig/foreman').
              with_content(%r{^FOREMAN_HOME=/usr/share/foreman$}).
              with_content(/^FOREMAN_USER=foreman$/).
              with_content(/^FOREMAN_ENV=production/).
              with_content(/^FOREMAN_USE_PASSENGER=1$/).
              with_ensure('file')
          end
        when 'Debian'
          it 'should set the defaults file' do
            should contain_file('/etc/default/foreman').
              with_content(/^START=no$/).
              with_content(%r{^FOREMAN_HOME=/usr/share/foreman$}).
              with_content(/^FOREMAN_USER=foreman$/).
              with_content(/^FOREMAN_ENV=production/).
              with_ensure('file')
          end
        end

        it { should contain_file('/usr/share/foreman').with_ensure('directory') }

        it { should contain_user('foreman').with({
          'ensure'  => 'present',
          'shell'   => '/bin/false',
          'comment' => 'Foreman',
          'gid'     => 'foreman',
          'groups'  => ['puppet'],
          'home'    => '/usr/share/foreman',
        })}

        it 'should remove old crons' do
          should contain_cron('clear_session_table').with_ensure('absent')
          should contain_cron('expire_old_reports').with_ensure('absent')
          should contain_cron('daily summary').with_ensure('absent')
        end

        it 'should contain foreman::config::passenger' do
          if facts[:osfamily] == 'RedHat' and facts[:operatingsystem] != 'Fedora'
            passenger_ruby = '/usr/bin/tfm-ruby'
          elsif facts[:osfamily] == 'Debian'
            passenger_ruby = '/usr/bin/foreman-ruby'
          else
            passenger_ruby = nil
          end

          should contain_class('foreman::config::passenger').
            with_listen_on_interface(nil).
            with_ruby(passenger_ruby).
            that_comes_before('Anchor[foreman::config_end]')
        end

        it { should contain_apache__vhost('foreman').without_custom_fragment(/Alias/) }
      end

      describe 'without passenger' do
        let :pre_condition do
          "class {'foreman':
            passenger => false,
          }"
        end

        it { should_not contain_class('foreman::config::passenger') }
      end

      describe 'with passenger interface' do
        let :pre_condition do
          "class {'apache':
            default_vhost => false,
          }
          class {'foreman':
            passenger_interface => 'lo',
          }"
        end

        it { should contain_class('foreman::config::passenger').with({
          :listen_on_interface => 'lo',
        })}
      end

      describe 'with different template parameters' do
        let :pre_condition do
          "class {'foreman':
            unattended            => false,
            authentication        => false,
            ssl                   => false,
            locations_enabled     => true,
            organizations_enabled => true,
            oauth_active          => false,
            oauth_map_users       => true,
            oauth_consumer_key    => 'abc',
            oauth_consumer_secret => 'def',
          }"
        end

        it 'should have changed parameters' do
          should contain_concat__fragment('foreman_settings+01-header.yaml').
            with_content(/^:unattended:\s*false$/).
            with_content(/^:login:\s*false$/).
            with_content(/^:require_ssl:\s*false$/).
            with_content(/^:locations_enabled:\s*true$/).
            with_content(/^:organizations_enabled:\s*true$/).
            with_content(/^:oauth_active:\s*false$/).
            with_content(/^:oauth_map_users:\s*true$/).
            with_content(/^:oauth_consumer_key:\s*abc$/).
            with_content(/^:oauth_consumer_secret:\s*def$/).
            with({})
        end
      end

      describe 'with url ending with trailing slash' do
        let :pre_condition do
          "class {'foreman':
            foreman_url => 'https://example.com/',
          }"
        end

        it { should contain_apache__vhost('foreman').without_custom_fragment(/Alias/) }
      end

      describe 'with sub-uri' do
        let :pre_condition do
          "class {'foreman':
            foreman_url => 'https://example.com/foreman',
          }"
        end

        it { should contain_apache__vhost('foreman').with_custom_fragment(/Alias \/foreman/) }
      end

      describe 'with sub-uri ending with trailing slash' do
        let :pre_condition do
          "class {'foreman':
            foreman_url => 'https://example.com/foreman/',
          }"
        end

        it { should contain_apache__vhost('foreman').with_custom_fragment(/Alias \/foreman/) }
      end

      describe 'with sub-uri ending with more levels' do
        let :pre_condition do
          "class {'foreman':
            foreman_url => 'https://example.com/apps/foreman/',
          }"
        end

        it { should contain_apache__vhost('foreman').with_custom_fragment(/Alias \/apps\/foreman/) }
      end

      describe 'with mysql db_type' do
        let :pre_condition do
          "class { 'foreman':
            db_type => 'mysql',
          }"
        end

        it 'should configure the mysql database' do
          should contain_file('/etc/foreman/database.yml').with_content(/adapter: mysql2/)
        end
      end

      describe 'with loggers' do
        let :pre_condition do
          "class { 'foreman':
            loggers => {'ldap' => true},
          }"
        end

        it 'should set loggers config' do
          should contain_concat__fragment('foreman_settings+01-header.yaml').
            with_content(/^:loggers:\n\s+:ldap:\n\s+:enabled:\s*true$/)
        end
      end

      describe 'with email configured for SMTP' do
        let :pre_condition do
          "class {'foreman':
             email_delivery_method => 'smtp',
           }"
        end

        it 'should contain email.yaml with SMTP set' do
          should contain_file('/etc/foreman/email.yaml').
            with_content(/delivery_method: :smtp/).
            with_ensure('file')
        end
      end

      describe 'with email configured and authentication set to login' do
        let :pre_condition do
          "class {'foreman':
            email_delivery_method => 'smtp',
            email_smtp_authentication => 'login',
          }"
        end

        it 'should contain email.yaml with login authentication' do
          should contain_file('/etc/foreman/email.yaml').
            with_content(/authentication: :login/).
            with_ensure('file')
        end
      end

      describe 'with email configured for sendmail' do
        let :pre_condition do
          "class {'foreman':
            email_delivery_method => 'sendmail',
          }"
        end

        it 'should contain email.yaml with sendmail' do
          should contain_file('/etc/foreman/email.yaml').
            with_content(/delivery_method: :sendmail/).
            with_ensure('file')
        end
      end

      describe 'with email configured in the database' do
        let :pre_condition do
          "class {'foreman':
            email_config_method   => 'database',
            email_delivery_method => 'sendmail',
          }"
        end

        it { should contain_file('/etc/foreman/email.yaml').with_ensure('absent') }
      end

      if Puppet.version >= '4.0'
        describe 'with AIO Puppet packages' do
          let :pre_condition do
            "class {'foreman':}"
          end
          let :facts do
            facts.merge({
              :rubysitedir => '/opt/puppetlabs/puppet/lib/ruby/site_ruby/2.1.0',
            })
          end
          it 'should set up puppetssldir accordingly' do
            should contain_concat__fragment('foreman_settings+01-header.yaml').
                with_content(/^:puppetssldir:\s*\/etc\/puppetlabs\/puppet\/ssl$/).
                with({})
          end
        end
      end
    end
  end
end
