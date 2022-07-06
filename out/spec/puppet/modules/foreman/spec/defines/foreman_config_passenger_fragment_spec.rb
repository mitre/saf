# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::config::passenger::fragment' do
  let(:title) { 'test' }

  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let :facts do facts end

      confd_dir = case facts[:osfamily]
                  when 'RedHat'
                    '/etc/httpd/conf.d'
                  when 'Debian'
                    '/etc/apache2/conf.d'
                  end

      context 'with ssl turned off' do
        let :pre_condition do
          "class { '::foreman::config::passenger':
              app_root                => '/usr/share/foreman',
              listen_on_interface     => '192.168.0.1',
              priority                => '05',
              ssl                     => false,
              ssl_cert                => 'cert.pem',
              ssl_certs_dir           => '',
              ssl_key                 => 'key.pem',
              ssl_ca                  => 'ca.pem',
              ssl_chain               => 'ca.pem',
              ssl_crl                 => 'crl.pem',
              ruby                    => '/usr/bin/tfm-ruby',
              user                    => 'foreman',
              prestart                => true,
              min_instances           => '1',
              start_timeout           => '600',
              use_vhost               => true,
              servername              => '#{facts[:fqdn]}',
              serveraliases           => ['foreman'],
              foreman_url             => 'https://#{facts[:fqdn]}',
              keepalive               => true,
              max_keepalive_requests  => 100,
              keepalive_timeout       => 5,
              server_port             => 80,
              server_ssl_port         => 443,
          }"
        end

        context 'with default parameters' do
          it { should contain_file("#{confd_dir}/05-foreman.d/test.conf").with_ensure(:absent) }
          it { should contain_file("#{confd_dir}/05-foreman-ssl.d/test.conf").with_ensure(:absent) }
        end

        context 'with content parameter' do
          let :params do
            { :content => '# config' }
          end

          it { should contain_file("#{confd_dir}/05-foreman.d/test.conf").with_content('# config') }
          it { should contain_file("#{confd_dir}/05-foreman-ssl.d/test.conf").with_ensure(:absent) }
        end

        context 'with ssl_content parameter' do
          let :params do
            { :ssl_content => '# config' }
          end

          it { should contain_file("#{confd_dir}/05-foreman.d/test.conf").with_ensure(:absent) }
          it { should contain_file("#{confd_dir}/05-foreman-ssl.d/test.conf").with_ensure(:absent) }
        end
      end

      context 'with ssl turned on' do
        let :pre_condition do
          "class { '::foreman::config::passenger':
              app_root                => '/usr/share/foreman',
              listen_on_interface     => '192.168.0.1',
              priority                => '05',
              ssl                     => true,
              ssl_cert                => 'cert.pem',
              ssl_certs_dir           => '',
              ssl_key                 => 'key.pem',
              ssl_ca                  => 'ca.pem',
              ssl_chain               => 'ca.pem',
              ssl_crl                 => 'crl.pem',
              ruby                    => '/usr/bin/tfm-ruby',
              user                    => 'foreman',
              prestart                => true,
              min_instances           => '1',
              start_timeout           => '600',
              use_vhost               => true,
              servername              => '#{facts[:fqdn]}',
              serveraliases           => ['foreman'],
              foreman_url             => 'https://#{facts[:fqdn]}',
              keepalive               => true,
              max_keepalive_requests  => 100,
              keepalive_timeout       => 5,
              server_port             => 80,
              server_ssl_port         => 443,
          }"
        end

        context 'with ssl_content parameter' do
          let :params do
            { :ssl_content => '# config' }
          end

          it { should contain_file("#{confd_dir}/05-foreman.d/test.conf").with_ensure(:absent) }
          it { should contain_file("#{confd_dir}/05-foreman-ssl.d/test.conf").with_content('# config') }
        end
      end
    end
  end
end
