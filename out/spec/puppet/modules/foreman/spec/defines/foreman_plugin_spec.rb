# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::plugin' do
  let :title do 'myplugin' end

  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let :facts do facts end

      let :pre_condition do
        'include foreman'
      end

      context 'no parameters' do
        it 'should install the correct package' do
          case facts[:osfamily]
          when 'RedHat'
            package_name = case facts[:operatingsystem]
                           when 'Fedora'
                             'rubygem-foreman_myplugin'
                           else
                             'tfm-rubygem-foreman_myplugin'
                           end
          when 'Debian'
            package_name = 'ruby-foreman-myplugin'
          end
          should contain_package(package_name).with_ensure('present')
        end

        it 'should not contain the config file' do
          should_not contain_file('/etc/foreman/plugins/foreman_myplugin.yaml')
        end
      end

      context 'with package parameter' do
        let :params do {
          :package => 'myplugin',
        } end

        it 'should install the correct package' do
          should contain_package('myplugin').with_ensure('present')
        end
      end

      context 'when handling underscores' do
        let :params do {
          :package => 'my_fun_plugin',
        } end

        it 'should use underscores' do
          package_name = case facts[:osfamily]
                         when 'RedHat'
                           'my_fun_plugin'
                         when 'Debian'
                           'my-fun-plugin'
                         end
          should contain_package(package_name).with_ensure('present')
        end
      end

      context 'when specifying a config' do
        let :params do {
          :config  => 'the config content',
          :package => 'myplugin'
        } end

        it 'should contain the config file' do
          should contain_file('/etc/foreman/plugins/foreman_myplugin.yaml').
            with_ensure('file').
            with_owner('root').
            with_group('root').
            with_mode('0644').
            with_content('the config content').
            with_require("Package[#{params[:package]}]")
        end
      end
    end
  end
end
