# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::puppetmaster' do
  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let :facts do
        if facts[:osfamily] == 'RedHat' and facts[:operatingsystemmajrelease] == '6'
          facts[:rubyversion] = '1.8.7'
        end

        facts
      end

      describe 'without custom parameters' do
        case facts[:osfamily]
        when 'RedHat'
          case facts[:operatingsystemmajrelease]
          when '6'
            site_ruby = '/usr/lib/ruby/site_ruby/1.8'
          else
            site_ruby = '/usr/share/ruby/vendor_ruby'
          end
          json_package = 'rubygem-json'
          etc_dir = '/etc'
          puppet_vardir = '/var/lib/puppet'
        when 'Debian'
          site_ruby = '/usr/lib/ruby/vendor_ruby'
          json_package = 'ruby-json'
          etc_dir = '/etc'
          puppet_vardir = '/var/lib/puppet'
        when 'FreeBSD'
          site_ruby = '/usr/local/lib/ruby/site_ruby/2.1'
          json_package = 'rubygem-json'
          etc_dir = '/usr/local/etc'
          puppet_vardir = '/var/puppet'
        end

        it 'should set up reports' do
          should contain_exec('Create Puppet Reports dir').with({
            :command => "/bin/mkdir -p #{site_ruby}/puppet/reports",
            :creates => "#{site_ruby}/puppet/reports",
          })

          should contain_file("#{site_ruby}/puppet/reports/foreman.rb").with({
            :mode    => '0644',
            :owner   => 'root',
            :group   => '0',
            :source  => 'puppet:///modules/foreman/foreman-report_v2.rb',
            :require => 'Exec[Create Puppet Reports dir]',
          })
        end

        it 'should set up enc' do
          should contain_file("#{etc_dir}/puppet/node.rb").with({
            :mode   => '0550',
            :owner  => 'puppet',
            :group  => 'puppet',
            :source => 'puppet:///modules/foreman/external_node_v2.rb',
          })
        end

        it 'should install json package' do
          should contain_package(json_package).with_ensure('present')
        end

        it 'should create puppet.yaml' do
          should contain_file("#{etc_dir}/puppet/foreman.yaml").
            with_content(%r{^:url: "https://#{facts[:fqdn]}"$}).
            with_content(%r{^:ssl_ca: "#{puppet_vardir}/ssl/certs/ca.pem"$}).
            with_content(%r{^:ssl_cert: "#{puppet_vardir}/ssl/certs/#{facts[:fqdn]}.pem"$}).
            with_content(%r{^:ssl_key: "#{puppet_vardir}/ssl/private_keys/#{facts[:fqdn]}.pem"$}).
            with_content(/^:user: ""$/).
            with_content(/^:password: ""$/).
            with_content(%r{^:puppetdir: "#{puppet_vardir}"$}).
            with_content(/^:facts: true$/).
            with_content(/^:timeout: 60$/).
            with_content(/^:report_timeout: 60$/).
            with({
              :mode  => '0640',
              :owner => 'root',
              :group => 'puppet',
            })
        end
      end

      describe 'without reports' do
        let :params do
          {:reports => false}
        end

        it 'should not include reports' do
          should_not contain_exec('Create Puppet Reports dir')

          should_not contain_file('/usr/lib/ruby/site_ruby/1.8/puppet/reports/foreman.rb')
        end
      end

      describe 'without enc' do
        let :params do
          {:enc => false}
        end

        it 'should not include enc' do
          should_not contain_file('/etc/puppet/node.rb')
        end
      end
    end
  end

  # TODO on_os_under_test?
  context 'Amazon' do
    let :facts do
      {
        :operatingsystem => 'Amazon',
        :rubyversion     => '1.8.7',
        :osfamily        => 'Linux',
        :puppetversion   => Puppet.version,
        :rubysitedir     => '/usr/lib/ruby/site_ruby',
      }
    end

    describe 'without custom parameters' do
      it 'should set up reports' do
        should contain_exec('Create Puppet Reports dir').with({
          :command => '/bin/mkdir -p /usr/lib/ruby/site_ruby/1.8/puppet/reports',
          :creates => '/usr/lib/ruby/site_ruby/1.8/puppet/reports',
        })

        should contain_file('/usr/lib/ruby/site_ruby/1.8/puppet/reports/foreman.rb').with({
          :mode    => '0644',
          :owner   => 'root',
          :group   => '0',
          :source  => 'puppet:///modules/foreman/foreman-report_v2.rb',
          :require => 'Exec[Create Puppet Reports dir]',
        })
      end

      it 'should install json package' do
        should contain_package('rubygem-json').with_ensure('present')
      end
    end
  end
end
