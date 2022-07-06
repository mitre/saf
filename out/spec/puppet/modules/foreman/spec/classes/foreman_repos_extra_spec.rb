# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::repos::extra' do

  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let :facts do facts end

      describe 'when repos are fully enabled' do
        case facts[:osfamily]
        when 'RedHat'
          if facts[:operatingsystem] != 'Fedora'
            let(:params) do
              {
                :configure_scl_repo  => true,
                :configure_epel_repo => true,
              }
            end

            let(:gpgkey) do
              case facts[:operatingsystemmajrelease]
              when '6'
                '0608B895'
              when '7'
                '352C64E5'
              end
            end

            it { should contain_yumrepo('epel').with({
              :mirrorlist => "https://mirrors.fedoraproject.org/metalink?repo=epel-#{facts[:operatingsystemmajrelease]}&arch=$basearch",
              :gpgcheck   => 1,
              :gpgkey     => "https://fedoraproject.org/static/#{gpgkey}.txt",
            }) }
            it { should contain_package('foreman-release-scl') }
          end
        end
      end

      describe 'when fully disabled' do
        let(:params) do
          {
            :configure_scl_repo       => false,
            :configure_epel_repo      => false,
          }
        end

        it { should_not contain_yumrepo('epel') }
        it { should_not contain_package('foreman-release-scl') }
        it { should_not contain_class('apt') }
        it { should have_apt__ppa_resource_count(0) }
      end
    end
  end
end
