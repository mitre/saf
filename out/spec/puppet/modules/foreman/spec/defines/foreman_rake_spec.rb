# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::rake' do

  let(:title) { 'db:migrate' }

  context 'on RedHat' do
    let :facts do
      on_supported_os['redhat-7-x86_64']
    end

    context 'without parameters' do
      # These parameters are inherited normally, but here we cheat for performance
      let :params do
        {
          :user     => 'foreman',
          :app_root => '/usr/share/foreman',
        }
      end

      it { should contain_exec('foreman-rake-db:migrate').with({
        'command'     => '/usr/sbin/foreman-rake db:migrate',
        'user'        => 'foreman',
        'environment' => ['HOME=/usr/share/foreman'],
        'logoutput'   => 'on_failure',
        'refreshonly' => true,
      })}
    end

    context 'with environment' do
      let :params do
        {
          :environment => {'SEED_USER' => 'admin'},
          :user        => 'foreman',
          :app_root    => '/usr/share/foreman',
        }
      end

      it { should contain_exec('foreman-rake-db:migrate').with({
        'command'     => '/usr/sbin/foreman-rake db:migrate',
        'user'        => 'foreman',
        'environment' => ['HOME=/usr/share/foreman', 'SEED_USER=admin'],
        'logoutput'   => 'on_failure',
        'refreshonly' => true,
        'timeout'     => nil,
      })}
    end

    context 'with timeout' do
      let :params do
        {
          :timeout  => 60,
          :user     => 'foreman',
          :app_root => '/usr/share/foreman',
        }
      end

      it { should contain_exec('foreman-rake-db:migrate').with({
        'command'     => '/usr/sbin/foreman-rake db:migrate',
        'user'        => 'foreman',
        'environment' => ['HOME=/usr/share/foreman'],
        'timeout'     => 60,
        'logoutput'   => 'on_failure',
        'refreshonly' => true,
      })}
    end
  end
end
