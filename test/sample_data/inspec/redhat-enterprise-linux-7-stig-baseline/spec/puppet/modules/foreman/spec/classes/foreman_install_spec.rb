# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::install' do
  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let :facts do facts end

      describe 'without parameters' do
        let :pre_condition do
          "class {'foreman':}"
        end

        case facts[:osfamily]
        when 'RedHat'
          configure_scl_repo = (facts[:operatingsystem] != 'Fedora')

          it { should contain_foreman__repos('foreman') }
          it { should contain_class('foreman::repos::extra').with({
            :configure_scl_repo       => configure_scl_repo,
            :configure_epel_repo      => facts[:operatingsystem] != 'Fedora',
          })}
          it { should contain_package('foreman-postgresql').with_ensure('present') }

          if facts[:operatingsystem] != 'Fedora'
            it { should contain_package('tfm-rubygem-passenger-native') }
          end
        when 'Debian'
          it { should contain_foreman__repos('foreman') }
          it { should contain_class('foreman::repos::extra').with({
            :configure_scl_repo       => false,
            :configure_epel_repo      => false,
          })}
          it { should contain_package('foreman-postgresql').with_ensure('present') }
        end
      end

      describe 'with version' do
        let :pre_condition do
          "class {'foreman':
            version => 'latest',
          }"
        end

        it { should contain_foreman__repos('foreman') }
        it { should contain_package('foreman-postgresql').with_ensure('latest') }
      end

      describe 'with custom repo' do
        let :pre_condition do
          "class {'foreman':
            custom_repo => true,
          }"
        end

        it { should_not contain_foreman__repos('foreman') }
        it { should contain_package('foreman-postgresql') }
      end

      describe 'with sqlite' do
        let :pre_condition do
          "class {'foreman':
            db_type => 'sqlite',
           }"
        end

        case facts[:osfamily]
        when 'RedHat'
          it { should contain_package('foreman-sqlite') }
        when 'Debian'
          it { should contain_package('foreman-sqlite3') }
        end
      end

      describe 'with postgresql' do
        let :pre_condition do
          "class {'foreman':
            db_type => 'postgresql',
           }"
        end

        it { should contain_package('foreman-postgresql') }
      end

      describe 'with mysql' do
        let :pre_condition do
          "class {'foreman':
            db_type => 'mysql',
           }"
        end

        it { should contain_package('foreman-mysql2') }
      end

      describe 'with unknown DB type' do
        let :pre_condition do
          "class {'foreman':
            db_type => 'unknown',
           }"
        end
        it { should raise_error(Puppet::Error, /unknown database type/) }
      end

      if facts[:osfamily] == 'RedHat'
        context 'with SELinux enabled' do
          let :facts do
            facts.merge({:selinux => true})
          end

          describe 'with selinux undef' do
            let :pre_condition do
              "class {'foreman': }"
            end
            it { should contain_package('foreman-selinux') }
          end

          describe 'with selinux false' do
            let :pre_condition do
              "class {'foreman':
                 selinux => false,
               }"
            end
            it { should_not contain_package('foreman-selinux') }
          end

          describe 'with selinux true' do
            let :pre_condition do
              "class {'foreman':
                 selinux => true,
               }"
            end
            it { should contain_package('foreman-selinux') }
          end
        end

        context 'with SELinux disabled' do
          let :facts do
            facts.merge({:selinux => false})
          end

          describe 'with selinux undef' do
            let :pre_condition do
              "class {'foreman': }"
            end
            it { should_not contain_package('foreman-selinux') }
          end

          describe 'with selinux false' do
            let :pre_condition do
              "class {'foreman':
                 selinux => false,
               }"
            end
            it { should_not contain_package('foreman-selinux') }
          end

          describe 'with selinux true' do
            let :pre_condition do
              "class {'foreman':
                 selinux => true,
               }"
            end
            it { should contain_package('foreman-selinux') }
          end
        end
      end
    end
  end
end
