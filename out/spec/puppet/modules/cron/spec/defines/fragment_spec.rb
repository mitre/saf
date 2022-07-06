# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'cron::fragment' do

  let(:title) { 'example' }
  let(:facts) do
    {
      :osfamily               => 'RedHat',
      :operatingsystemrelease => '6.7',
    }
  end

  context 'with default values for parameters on valid OS' do
    it { should compile.with_all_deps }
    it { should contain_class('cron') }
    it {
      should contain_file('/etc/cron.daily/example').with({
        'ensure'  => 'absent',
        'owner'   => 'root',
        'group'   => 'root',
        'mode'    => '0755',
        'content' => nil,
        'require' => 'File[crontab]',
      })
    }
  end

  context 'with optional parameters set' do
    context 'with content set to <0 0 2 4 2 root command>' do
      let(:params) { { :content => '0 0 2 4 2 root command' } }
      it { should contain_file('/etc/cron.daily/example').with_content('0 0 2 4 2 root command') }
    end

    context 'when ensure, owner, group and mode are set' do
      let (:params) do
        {
          :ensure => 'present',
          :owner  => 'operator',
          :group  => 'operator',
          :mode   => '0242',
        }
      end

      it {
        should contain_file('/etc/cron.daily/example').with({
          'ensure'  => 'present',
          'owner'   => 'operator',
          'group'   => 'operator',
          'mode'    => '0242',
        })
      }
    end

    ['d','hourly','daily','monthly','weekly','yearly'].each do |interval|
      context "when type is set to <#{interval}>" do
        let (:params) { { :type => "#{interval}"} }

        if interval == 'd'
          filemode = '0644'
        else
          filemode = '0755'
        end
        it { should contain_file("/etc/cron.#{interval}/example").with_mode(filemode) }
      end
    end
  end

  ['absent','file','present'].each do |value|
    describe "with deprecated parameter ensure_cron set to #{value} (as #{value.class})" do
      let (:params) { { :ensure_cron => value} }

      it { should contain_notify('*** DEPRECATION WARNING***: $cron::fragment::ensure_cron was renamed to $ensure. Please update your configuration. Support for $ensure_cron will be removed in the near future!') }
      it { should contain_file('/etc/cron.daily/example').with_ensure(value) }
    end
  end

  describe "with deprecated parameter cron_content set to <0 0 2 4 2 root deprecated>" do
    let (:params) { { :cron_content => '0 0 2 4 2 root deprecated'} }

    it { should contain_notify('*** DEPRECATION WARNING***: $cron::fragment::cron_content was renamed to $content. Please update your configuration. Support for $cron_content will be removed in the near future!') }
    it { should contain_file('/etc/cron.daily/example').with_content('0 0 2 4 2 root deprecated') }
  end

  describe 'variable type and content validations' do
    # set needed custom facts and variables
    let(:facts) do
      {
        :osfamily => 'RedHat',
        :operatingsystemrelease => '6.7',
      }
    end
    let(:validation_params) { {
#      :param => 'value',
    } }

    validations = {
      'regex_file_ensure' => {
        :name    => ['ensure'],
        :valid   => ['absent','file','present'],
        :invalid => ['invalid','directory','link',['array'],a={'ha'=>'sh'},3,2.42,true,false,nil],
        :message => 'must be absent, file or present',
      },
      'regex_file_mode' => {
        :name    => ['mode'],
        :valid   => ['0755','0644','0242'],
        :invalid => ['invalid','755',0755,'0980',['array'],a={'ha'=>'sh'},3,2.42,true,false,nil],
        :message => 'must be a valid four digit mode in octal notation',
      },
      'regex_type' => {
        :name    => ['type'],
        :valid   => ['d','hourly','daily','monthly','weekly','yearly'],
        :invalid => ['biweekly',['array'],a={'ha'=>'sh'},3,2.42,true,false,nil],
        :message => 'must be d, hourly, daily, monthly, weekly or yearly',
      },
      'string' => {
        :name    => ['content','owner','group'],
        :valid   => ['valid'],
        :invalid => [['array'],a={'ha'=>'sh'},3,2.42,true,false],
        :message => 'must be a string',
      },
    }

    validations.sort.each do |type,var|
      var[:name].each do |var_name|

        var[:valid].each do |valid|
          context "with #{var_name} (#{type}) set to valid #{valid} (as #{valid.class})" do
            let(:params) { validation_params.merge({:"#{var_name}" => valid, }) }
            it { should compile }
          end
        end

        var[:invalid].each do |invalid|
          context "with #{var_name} (#{type}) set to invalid #{invalid} (as #{invalid.class})" do
            let(:params) { validation_params.merge({:"#{var_name}" => invalid, }) }
            it 'should fail' do
              expect {
                should contain_class(subject)
              }.to raise_error(Puppet::Error,/#{var[:message]}/)
            end
          end
        end
      end # var[:name].each
    end # validations.sort.each
  end # describe 'variable type and content validations'
end
