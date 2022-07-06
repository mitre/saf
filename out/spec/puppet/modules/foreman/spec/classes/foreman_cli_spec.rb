# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::cli' do

  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let :facts do facts end

      context 'standalone with parameters' do
        let(:params) do {
          'foreman_url' => 'http://example.com',
          'username'    => 'joe',
          'password'    => 'secret',
        } end

        it { should contain_package('foreman-cli').with_ensure('installed') }

        describe '/etc/hammer/cli.modules.d/foreman.yml' do
          it 'should contain settings' do
            verify_exact_contents(catalogue, '/etc/hammer/cli.modules.d/foreman.yml', [
              ":foreman:",
              "  :enable_module: true",
              "  :host: 'http://example.com'",
            ])
          end
        end

        describe '/root/.hammer/cli.modules.d/foreman.yml' do
          it { should contain_file('/root/.hammer/cli.modules.d/foreman.yml').with_replace(false) }

          it 'should contain settings' do
            verify_exact_contents(catalogue, '/root/.hammer/cli.modules.d/foreman.yml', [
              ":foreman:",
              "  :username: 'joe'",
              "  :password: 'secret'",
              "  :refresh_cache: false",
              "  :request_timeout: 120",
            ])
          end
        end

        describe 'with manage_root_config=false' do
          let(:params) do {
            'foreman_url' => 'http://example.com',
            'username'    => 'joe',
            'password'    => 'secret',
            'manage_root_config' => false,
          } end

          it { should_not contain_file('/root/.hammer') }
          it { should_not contain_file('/root/.hammer/cli.modules.d/foreman.yml') }
        end

        context 'with ssl_ca_file' do
          let(:params) do {
            'foreman_url' => 'http://example.com',
            'username'    => 'joe',
            'password'    => 'secret',
            'ssl_ca_file' => '/etc/ca.pub',
          } end

          describe '/etc/hammer/cli.modules.d/foreman.yml' do
            it 'should contain settings' do
              verify_exact_contents(catalogue, '/etc/hammer/cli.modules.d/foreman.yml', [
                ":foreman:",
                "  :enable_module: true",
                "  :host: 'http://example.com'",
                ":ssl:",
                "  :ssl_ca_file: '/etc/ca.pub'",
              ])
            end
          end
        end
      end

      context 'with foreman' do

        let :pre_condition do
          "class { 'foreman':
             admin_username => 'joe',
             admin_password => 'secret',
             server_ssl_ca  => '/etc/puppetlabs/puppet/ssl/certs/ca.pub',
           }"
        end

        it { should contain_package('foreman-cli').with_ensure('installed') }

        describe '/etc/hammer/cli.modules.d/foreman.yml' do
          it 'should contain settings from foreman' do
            verify_exact_contents(catalogue, '/etc/hammer/cli.modules.d/foreman.yml', [
              ":foreman:",
              "  :enable_module: true",
              "  :host: 'https://#{facts[:fqdn]}'",
              ":ssl:",
              "  :ssl_ca_file: '/etc/puppetlabs/puppet/ssl/certs/ca.pub'",
            ])
          end
        end

        describe '/root/.hammer/cli.modules.d/foreman.yml' do
          it 'should contain settings from foreman' do
            verify_exact_contents(catalogue, '/root/.hammer/cli.modules.d/foreman.yml', [
              ":foreman:",
              "  :username: 'joe'",
              "  :password: 'secret'",
              "  :refresh_cache: false",
              "  :request_timeout: 120",
            ])
          end
        end
      end
    end
  end
end
