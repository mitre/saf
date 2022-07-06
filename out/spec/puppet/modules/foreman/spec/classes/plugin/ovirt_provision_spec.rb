# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::plugin::ovirt_provision' do
  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let :facts do
        facts
      end

      let(:pre_condition) { 'include foreman' }

      it { should compile.with_all_deps }

      if facts[:operatingsystem] == 'Fedora'
        it 'should call the plugin' do
          should contain_foreman__plugin('ovirt_provision').with_package('rubygem-ovirt_provision_plugin')
        end
      elsif facts[:osfamily] == 'RedHat'
        it 'should call the plugin' do
          should contain_foreman__plugin('ovirt_provision').with_package('tfm-rubygem-ovirt_provision_plugin')
        end
      elsif facts[:osfamily] == 'Debian'
        it 'should call the plugin' do
          should contain_foreman__plugin('ovirt_provision').with_package('ruby-ovirt-provision-plugin')
        end
      end
    end
  end
end
