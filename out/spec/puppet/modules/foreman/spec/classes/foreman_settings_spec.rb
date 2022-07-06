# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::settings' do
  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let(:facts) { facts }
      let(:sample_params) do {
        email_config_method: 'database',
        email_delivery_method: 'sendmail',
        email_smtp_address: 'smtp.example.com',
        email_smtp_port: 25,
        email_smtp_domain: 'example.com',
        email_smtp_authentication: 'none',
        email_smtp_user_name: 'smtp-username',
        email_smtp_password: 'smtp-password',
      } end

      describe 'with sample parameters' do
        let(:params) { sample_params }
        it { should contain_foreman_config_entry('delivery_method').with_value('sendmail') }
        it { should contain_foreman_config_entry('smtp_address').with_value('smtp.example.com') }
        it { should contain_foreman_config_entry('smtp_port').with_value('25') }
        it { should contain_foreman_config_entry('smtp_domain').with_value('example.com') }
        it { should contain_foreman_config_entry('smtp_authentication').with_value('') }
        it { should contain_foreman_config_entry('smtp_user_name').with_value('smtp-username') }
        it { should contain_foreman_config_entry('smtp_password').with_value('smtp-password') }
      end

      context 'with email_config_method=file' do
        let(:params) { sample_params.merge(email_config_method: 'file') }
        it { should_not contain_foreman_config_entry('delivery_method') }
      end

      context 'with email_smtp_authentication=cram-md5' do
        let(:params) { sample_params.merge(email_smtp_authentication: 'cram-md5') }
        it { should contain_foreman_config_entry('smtp_authentication').with_value('cram-md5') }
      end
    end
  end
end
