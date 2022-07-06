# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::repo' do
  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      describe "With default parametrs" do
        let :facts do
          facts
        end

        # Defaults based on what params.pp has
        configure = facts[:osfamily] == 'RedHat' && facts[:operatingsystem] != 'Fedora'
        let :params do
          {
            'custom_repo'         => false,
            'repo'                => 'stable',
            'gpgcheck'            => true,
            'configure_epel_repo' => configure,
            'configure_scl_repo'  => configure,
          }
        end

        it 'should include OS repos' do
          is_expected.to contain_foreman__repos('foreman')
            .with_repo('stable')
            .with_gpgcheck(true)
        end

        it 'should include extra repos' do
          is_expected.to contain_class('foreman::repos::extra')
            .with_configure_epel_repo(configure)
            .with_configure_scl_repo(configure)
        end
      end
    end
  end
end
