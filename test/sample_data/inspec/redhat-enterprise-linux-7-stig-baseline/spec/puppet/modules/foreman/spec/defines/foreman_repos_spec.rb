# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::repos' do
  let(:title) { 'foreman' }

  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let :facts do
        facts
      end

      describe 'on stable' do
        let(:params) { {:repo => 'stable'} }

        case facts[:osfamily]
        when 'RedHat'
          case os
          when 'fedora-24-x86_64'
            yumcode = 'f24'
          else
            yumcode = "el#{facts[:operatingsystemmajrelease]}"
          end

          it { should contain_foreman__repos__yum('foreman').with({
            :repo     => 'stable',
            :yumcode  => yumcode,
            :gpgcheck => true,
          }) }
        when 'Debian'
          it { should contain_foreman__repos__apt('foreman').with_repo('stable') }
        end
      end
    end
  end

  # TODO: on_os_under_test?
  context 'on Amazon' do
    let :facts do
      {
        :operatingsystem        => 'Amazon',
        :operatingsystemrelease => '6.4',
        :osfamily               => 'Linux',
        :rubyversion            => '1.8.7',
        :rubysitedir            => '/usr/lib/ruby/site_ruby',
        :puppetversion          => Puppet.version,
      }
    end

    let(:params) { {:repo => 'stable'} }

    it do
      should contain_foreman__repos__yum('foreman').with({
        :repo     => 'stable',
        :yumcode  => 'el6',
        :gpgcheck => true,
      })
    end
  end

  context 'on unsupported Linux operatingsystem' do
    let :facts do
      {
        :hostname        => 'localhost',
        :operatingsystem => 'unsupported',
        :osfamily        => 'Linux',
      }
    end

    let(:params) { {:repo => 'stable'} }

    it 'should fail' do
      should raise_error(/#{facts[:hostname]}: This module does not support operatingsystem #{facts[:operatingsystem]}/)
    end
  end

  context 'on unsupported osfamily' do
    let :facts do
      {
        :hostname => 'localhost',
        :osfamily => 'unsupported',
      }
    end

    let(:params) { {:repo => 'stable'} }

    it 'should fail' do
      should raise_error(/#{facts[:hostname]}: This module does not support osfamily #{facts[:osfamily]}/)
    end
  end
end
