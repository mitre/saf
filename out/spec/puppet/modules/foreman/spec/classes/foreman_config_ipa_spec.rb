# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::config' do

  on_os_under_test.each do |os, facts|
    if facts[:osfamily] == 'RedHat'
      context "on #{os}" do
        let(:facts) do
          facts.merge({
            :interfaces => '',
          })
        end

        describe 'without parameters' do
          let :pre_condition do
            "class {'foreman':}"
          end

          it('should not integrate ipa') { should_not contain_exec('ipa-getkeytab') }
        end

        # we don't allow ipa on non-passenger env
        describe 'with freeipa enabled' do
          let :pre_condition do
            "class {'foreman':
             passenger => false,
             ipa_authentication => true,
           }"
          end

          it "will fail" do
            should raise_error(Puppet::Error, /External authentication via IPA can only be enabled when passenger is used/)
          end
        end

        describe 'with passenger and ipa' do
          let :pre_condition do
            "class {'foreman':
            passenger => true,
            ipa_authentication => true,
          }"
          end

          describe 'not IPA-enrolled system' do
            describe 'ipa_server fact missing' do
              it "will fail" do
                expect {
                  should contain_exec('ipa-getkeytab')
                }.to raise_error(Puppet::Error, /The system does not seem to be IPA-enrolled/)
              end
            end

            describe 'default_ipa_realm fact missing' do
              it "will fail" do
                expect {
                  should contain_exec('ipa-getkeytab')
                }.to raise_error(Puppet::Error, /The system does not seem to be IPA-enrolled/)
              end
            end
          end

          describe 'enrolled system' do
            let :enrolled_facts do
              facts.merge({
                :interfaces => '',
                :default_ipa_server => 'ipa.example.com',
                :default_ipa_realm => 'REALM',
                :sssd_services => 'ifp',
                :sssd_ldap_user_extra_attrs => '',
                :sssd_allowed_uids => '',
                :sssd_user_attributes => '',
              })
            end
            let(:facts) { enrolled_facts }

            it { should contain_exec('ipa-getkeytab') }

            it 'should contain Passenger fragments' do
              should contain_foreman__config__passenger__fragment('intercept_form_submit').
                with_ssl_content(/^\s*InterceptFormPAMService foreman$/)

              should contain_foreman__config__passenger__fragment('lookup_identity')

              should contain_foreman__config__passenger__fragment('auth_kerb').
                with_ssl_content(%r{^\s*KrbAuthRealms REALM$}).
                with_ssl_content(%r{^\s*Krb5KeyTab /etc/httpd/conf/http.keytab$}).
                with_ssl_content(%r{^\s*require pam-account foreman$})
            end

            describe 'on non-selinux' do
              let :facts do
                enrolled_facts.merge({
                  :selinux => 'false',
                })
              end

              it { should_not contain_exec('setsebool httpd_dbus_sssd') }
            end

            describe 'on selinux system but disabled by user' do
              let :facts do
                enrolled_facts.merge({
                  :selinux => 'true',
                })
              end

              let :pre_condition do
                "class {'foreman':
              passenger => true,
              ipa_authentication => true,
              selinux => false,
            }"
              end

              it { should_not contain_exec('setsebool httpd_dbus_sssd') }
            end

            describe 'on selinux system with enabled by user' do
              let :facts do
                enrolled_facts.merge({
                  :selinux => 'true',
                })
              end

              let :pre_condition do
                "class {'foreman':
              passenger => true,
              ipa_authentication => true,
              selinux => true,
            }"
              end

              it { should contain_exec('setsebool httpd_dbus_sssd') }
            end

            describe 'on selinux' do
              let :facts do
                enrolled_facts.merge({
                  :selinux => 'true',
                })
              end

              it { should contain_exec('setsebool httpd_dbus_sssd') }
            end
          end
        end
      end
    end
  end
end
