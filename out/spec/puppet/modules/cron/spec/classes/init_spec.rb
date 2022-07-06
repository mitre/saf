# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'cron' do
  let :facts do
    {
      :osfamily               => 'RedHat',
      :operatingsystemrelease => '6.7',
    }
  end

  crontab_default = <<-END.gsub(/^\s+\|/, '')
    |# This file is being maintained by Puppet.
    |# DO NOT EDIT
    |
    |SHELL=/bin/bash
    |PATH=/sbin:/bin:/usr/sbin:/usr/bin
    |MAILTO=root
    |HOME=/
    |# For details see man 4 crontabs
    |
    |# Example of job definition:
    |# .---------------- minute (0 - 59)
    |# |  .------------- hour (0 - 23)
    |# |  |  .---------- day of month (1 - 31)
    |# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
    |# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
    |# |  |  |  |  |
    |# *  *  *  *  * user-name command to be executed
    |
  END

  crontab_periodics_rhel5 = <<-END.gsub(/^\s+\|/, '')
    |# run-parts
    |01 * * * * root run-parts /etc/cron.hourly
    |02 4 * * * root run-parts /etc/cron.daily
    |22 4 * * 0 root run-parts /etc/cron.weekly
    |42 4 1 * * root run-parts /etc/cron.monthly
  END

  crontab_periodics_suse = <<-END.gsub(/^\s+\|/, '')
    |#
    |# check scripts in cron.hourly, cron.daily, cron.weekly, and cron.monthly
    |#
    |-*/15 * * * *   root  test -x /usr/lib/cron/run-crons && /usr/lib/cron/run-crons >/dev/null 2>&1
  END

  platforms = {
    'RedHat 5' =>
      {
        :osfamily     => 'RedHat',
        :osrelease    => '5.5',
        :package_name => 'crontabs',
        :service_name => 'crond',
        :crontab      => crontab_default + crontab_periodics_rhel5,
      },
    'RedHat 6' =>
      {
        :osfamily     => 'RedHat',
        :osrelease    => '6.7',
        :package_name => 'crontabs',
        :service_name => 'crond',
        :crontab      => crontab_default,
      },
    'Suse 10' =>
      {
        :osfamily     => 'Suse',
        :osrelease    => '10.4',
        :package_name => 'cron',
        :service_name => 'cron',
        :crontab      => crontab_default + crontab_periodics_suse,
      },
    'Suse 11' =>
      {
        :osfamily     => 'Suse',
        :osrelease    => '11.3',
        :package_name => 'cron',
        :service_name => 'cron',
        :crontab      => crontab_default + crontab_periodics_suse,
      },
    'Suse 12' =>
      {
        :osfamily     => 'Suse',
        :osrelease    => '12.1',
        :package_name => 'cronie',
        :service_name => 'cron',
        :crontab      => crontab_default + crontab_periodics_suse,
      },
    'Ubuntu 12' =>
      {
        :osfamily     => 'Debian',
        :osrelease    => '12.04',
        :package_name => 'cron',
        :service_name => 'cron',
        :crontab     => crontab_default,
      },
  }



  describe 'with default values for parameters on valid OS' do
    it {
      should contain_package('crontabs').with({
        'ensure' => 'installed',
        'before' => [
          'File[cron_allow]',
          'File[cron_deny]',
          'File[crontab]',
          'File[cron_d]',
          'File[cron_hourly]',
          'File[cron_daily]',
          'File[cron_weekly]',
          'File[cron_monthly]',
        ],
      })
    }
    it {
      should contain_file('cron_allow').with({
        'ensure'  => 'absent',
        'path'    => '/etc/cron.allow',
        'owner'   => 'root',
        'group'   => 'root',
        'mode'    => '0644',
        'content' => "# This file is being maintained by Puppet.\n# DO NOT EDIT\n",
      })
    }
    it {
      should contain_file('cron_deny').with({
        'ensure'  => 'present',
        'path'    => '/etc/cron.deny',
        'owner'   => 'root',
        'group'   => 'root',
        'mode'    => '0644',
        'content' => "# This file is being maintained by Puppet.\n# DO NOT EDIT\n",
      })
    }
    it {
      should contain_file('crontab').with({
        'ensure'  => 'file',
        'path'    => '/etc/crontab',
        'owner'   => 'root',
        'group'   => 'root',
        'mode'    => '0644',
        'content' => crontab_default,
      })
    }
    it {
      should contain_file('cron_d').with({
        'ensure'  => 'directory',
        'path'    => '/etc/cron.d',
        'owner'   => 'root',
        'group'   => 'root',
        'mode'    => '0755',
      })
    }
    it {
      should contain_file('cron_hourly').with({
        'ensure'  => 'directory',
        'path'    => '/etc/cron.hourly',
        'owner'   => 'root',
        'group'   => 'root',
        'mode'    => '0755',
      })
    }
    it {
      should contain_file('cron_daily').with({
        'ensure'  => 'directory',
        'path'    => '/etc/cron.daily',
        'owner'   => 'root',
        'group'   => 'root',
        'mode'    => '0755',
      })
    }
    it {
      should contain_file('cron_weekly').with({
        'ensure'  => 'directory',
        'path'    => '/etc/cron.weekly',
        'owner'   => 'root',
        'group'   => 'root',
        'mode'    => '0755',
      })
    }
    it {
      should contain_file('cron_monthly').with({
        'ensure'  => 'directory',
        'path'    => '/etc/cron.monthly',
        'owner'   => 'root',
        'group'   => 'root',
        'mode'    => '0755',
      })
    }
    it {
      should contain_service('cron').with({
        'ensure'    => 'running',
        'enable'    => true,
        'name'      => 'crond',
        'require'   => 'File[crontab]',
        'subscribe' => 'File[crontab]',
      })
    }
    it { should have_cron__fragment_resource_count(0) }

  end

  platforms.sort.each do |k,v|
    describe "with default values for parameters when OS is #{k}" do
      let :facts do
        {
          :osfamily               => v[:osfamily],
          :operatingsystemrelease => v[:osrelease],
        }
      end

      it { should contain_package(v[:package_name]) }
      it { should contain_service('cron').with_name("#{v[:service_name]}") }
      it {
        should contain_file('crontab').with({
          'ensure'  => 'file',
          'path'    => '/etc/crontab',
          'owner'   => 'root',
          'group'   => 'root',
          'mode'    => '0644',
          'content' => v[:crontab],
        })
      }
    end
  end

  describe 'with cron_hourly_path, cron_daily_path, cron_weekly_path and cron_monthly_path set on RedHat 5' do
    let (:facts) do
      {
        :osfamily               => 'RedHat',
        :operatingsystemrelease => '5.5',
      }
    end
    let (:params) do
      {
        :cron_hourly_path  => '/path/to/hourly',
        :cron_daily_path   => '/path/to/daily',
        :cron_weekly_path  => '/path/to/weekly',
        :cron_monthly_path => '/path/to/monthly',
      }
    end

    crontab_periodics = <<-END.gsub(/^\s+\|/, '')
      |# run-parts
      |01 * * * * root run-parts /path/to/hourly
      |02 4 * * * root run-parts /path/to/daily
      |22 4 * * 0 root run-parts /path/to/weekly
      |42 4 1 * * root run-parts /path/to/monthly
    END

    it {
      should contain_file('crontab').with({
        'ensure'  => 'file',
        'path'    => '/etc/crontab',
        'owner'   => 'root',
        'group'   => 'root',
        'mode'    => '0644',
        'content' => crontab_default + crontab_periodics,
      })
    }
  end

  describe 'with optional parameters set' do
    context 'when cron_allow, cron_allow_group, cron_allow_mode, cron_allow_owner and cron_allow_path are set' do
      let (:params) do
        {
          :cron_allow       => 'present',
          :cron_allow_group => 'cron_allow_group',
          :cron_allow_mode  => '0400',
          :cron_allow_owner => 'cron_allow_owner',
          :cron_allow_path  => '/spec/cron_allow',
        }
      end

      it {
        should contain_file('cron_allow').with({
          'ensure'  => 'present',
          'path'    => '/spec/cron_allow',
          'owner'   => 'cron_allow_owner',
          'group'   => 'cron_allow_group',
          'mode'    => '0400',
        })
      }
    end

    context 'when cron_deny, cron_deny_group, cron_deny_mode, cron_deny_owner and cron_deny_path are set' do
      let (:params) do
        {
          :cron_deny       => 'absent',
          :cron_deny_group => 'cron_deny_group',
          :cron_deny_mode  => '0400',
          :cron_deny_owner => 'cron_deny_owner',
          :cron_deny_path  => '/spec/cron_deny',
        }
      end

      it {
        should contain_file('cron_deny').with({
          'ensure'  => 'absent',
          'path'    => '/spec/cron_deny',
          'owner'   => 'cron_deny_owner',
          'group'   => 'cron_deny_group',
          'mode'    => '0400',
        })
      }
    end

    context 'when crontab_group, crontab_mode, crontab_owner and crontab_path are set' do
      let (:params) do
        {
          :crontab_group => 'crontab_group',
          :crontab_mode  => '0400',
          :crontab_owner => 'crontab_owner',
          :crontab_path  => '/spec/crontab',
        }
      end
      it {
        should contain_file('crontab').with({
          'path'    => '/spec/crontab',
          'owner'   => 'crontab_owner',
          'group'   => 'crontab_group',
          'mode'    => '0400',
        })
      }
    end

    context 'when service_enable, service_ensure and service_name are set' do
      let (:params) do
        {
          :service_ensure => 'stopped',
          :service_enable => false,
          :service_name   => 'vixie',
        }
      end

      it {
        should contain_service('cron').with({
          'ensure' => 'stopped',
          'enable' => 'false',
          'name'   => 'vixie',
        })
      }
    end

    context 'when cron_allow_users is set to <[\'spec\',\'test\',\'allow\']>' do
      let (:params) { { :cron_allow_users => ['spec','test','allow'] } }
      it { should contain_file('cron_allow').with_content("# This file is being maintained by Puppet.\n# DO NOT EDIT\nspec\ntest\nallow\n") }
    end

    context 'when cron_d_path is set to </spec/cron_d>' do
      let (:params) { { :cron_d_path => '/spec/cron_d'} }
      it { should contain_file('cron_d').with_path('/spec/cron_d') }
    end

    ['daily','hourly','monthly','weekly'].each do |interval|
      context "when cron_#{interval}_path is set to </spec/cron_daily>" do
        let (:params) { { :"cron_#{interval}_path" => "/spec/cron_#{interval}"} }
        it { should contain_file("cron_#{interval}").with_path("/spec/cron_#{interval}") }
      end
    end

    context 'when cron_deny_users is set to <[\'spec\',\'test\',\'deny\']>' do
      let (:params) { { :cron_deny_users => ['spec','test','deny'] } }
      it { should contain_file('cron_deny').with_content("# This file is being maintained by Puppet.\n# DO NOT EDIT\nspec\ntest\ndeny\n") }
    end

    context 'when cron_dir_group is set to <cron_dir_group>' do
      let (:params) { { :cron_dir_group => 'cron_dir_group' } }
      ['cron_d','cron_daily','cron_hourly','cron_monthly','cron_weekly'].each do |file_resource|
        it { should contain_file(file_resource).with_group('cron_dir_group') }
      end
    end

    context 'when cron_dir_mode is set to <0242>' do
      let (:params) { { :cron_dir_mode => '0242' } }
      ['cron_d','cron_daily','cron_hourly','cron_monthly','cron_weekly'].each do |file_resource|
        it { should contain_file(file_resource).with_mode('0242') }
      end
    end

    context 'when cron_dir_owner is set to <cron_dir_owner>' do
      let (:params) { { :cron_dir_owner => 'cron_dir_owner' } }
      ['cron_d','cron_daily','cron_hourly','cron_monthly','cron_weekly'].each do |file_resource|
        it { should contain_file(file_resource).with_owner('cron_dir_owner') }
      end
    end

    context 'when cron_files is set to a valid value that will create two resources' do
      let (:params) { { :cron_files => {'spec' => {'content'=>'/bin/true'},'test' => {'content'=>'/bin/true'} } } }
      it { should have_cron__fragment_resource_count(2) }
      it { should contain_cron__fragment('spec') }
      it { should contain_cron__fragment('test') }
    end

    context 'when crontab_tasks is set to a valid value that will create two tasks' do
      let (:params) { { :crontab_tasks => {'spec' => ['0 0 2 4 2 root /bin/true','1 2 3 4 5 root /bin/false'],'test' => ['5 4 3 2 1 spec /bin/test$'] } } }
      it { should contain_file('crontab').with_content(/^# spec\n0 0 2 4 2 root \/bin\/true\n1 2 3 4 5 root \/bin\/false\n# test\n5 4 3 2 1 spec \/bin\/test/) }
    end

    crontab_string = <<-END.gsub(/^\s+\|/, '')
      |multi
      |line
      |string
    END

    context 'when periodic_jobs_content is set to a valid value as string' do
      let (:params) { { :periodic_jobs_content => "multi\nline\nstring" } }
      it { should contain_file('crontab').with_content("#{crontab_default}#{crontab_string}") }
    end

    crontab_array = <<-END.gsub(/^\s+\|/, '')
      |multi
      |value
      |array
    END

    context 'when periodic_jobs_content is set to a valid value as array' do
      let (:params) { { :periodic_jobs_content => %w(multi value array) } }
      it { should contain_file('crontab').with_content("#{crontab_default}#{crontab_array}") }
    end

    platforms.sort.each do |k,v|
      describe "when periodic_jobs_manage is set to a valid false on #{k}" do
        let :facts do
          {
            :osfamily               => v[:osfamily],
            :operatingsystemrelease => v[:osrelease],
          }
        end
        let (:params) { { :periodic_jobs_manage => false } }
        it { should contain_file('crontab').with_content(crontab_default) }
      end
    end

    context 'when periodic_jobs_manage is set to a valid false on RedHat 5' do
      let (:facts) do
        {
          :osfamily               => 'RedHat',
          :operatingsystemrelease => '5.5',
        }
      end
      let (:params) { { :periodic_jobs_manage => false } }
      it { should contain_file('crontab').with_content(crontab_default) }
    end

    # enhancement: move the default values from template to $crontab_vars and remove the without tests below
    context 'when crontab_vars is set to a valid value' do
      let (:params) { { :crontab_vars => {'SHELL' => '/bin/sh','PATH' => '/test', 'MAILTO' => 'operator', 'HOME'=>'/test' } } }
      it { should contain_file('crontab').with_content(/^HOME=\/test$/) }
      it { should contain_file('crontab').with_content(/^SHELL=\/bin\/sh$/) }
      it { should contain_file('crontab').with_content(/^PATH=\/test$/) }
      it { should contain_file('crontab').with_content(/^MAILTO=operator$/) }
      it { should contain_file('crontab').without_content(/^HOME=\/$/) }
      it { should contain_file('crontab').without_content(/^SHELL=\/bin\/bash$/) }
      it { should contain_file('crontab').without_content(/^PATH=\/sbin:\/bin:\/usr\/sbin:\/usr\/bin\$/) }
      it { should contain_file('crontab').without_content(/^MAILTO=root$/) }
    end

    context 'when service_enable is set to <false>' do
      let (:params) { { :service_enable => false } }
      it { should contain_service('cron').with_enable('false') }
    end

    context 'when package_ensure is set to <absent>' do
      let (:params) { { :package_ensure => 'absent' } }
      it { should contain_package('crontabs').with_ensure('absent') }
    end

    context 'when package_name is set to <cron242>' do
      let (:params) { { :package_name => 'cron242' } }
      it { should contain_package('cron242').with_before([
        'File[cron_allow]',
        'File[cron_deny]',
        'File[crontab]',
        'File[cron_d]',
        'File[cron_hourly]',
        'File[cron_daily]',
        'File[cron_weekly]',
        'File[cron_monthly]',
      ] ) }
    end
    context 'when package_name is set to <[\'cron242\',\'cronhelper\']>' do
      let (:params) { { :package_name => ['cron242','cronhelper'] } }
      it { should contain_package('cron242').with_before([
        'File[cron_allow]',
        'File[cron_deny]',
        'File[crontab]',
        'File[cron_d]',
        'File[cron_hourly]',
        'File[cron_daily]',
        'File[cron_weekly]',
        'File[cron_monthly]',
      ] ) }
      it { should contain_package('cronhelper').with_before([
        'File[cron_allow]',
        'File[cron_deny]',
        'File[crontab]',
        'File[cron_d]',
        'File[cron_hourly]',
        'File[cron_daily]',
        'File[cron_weekly]',
        'File[cron_monthly]',
      ] ) }
    end
  end

  describe 'with default values for parameters on invalid OS' do
    let (:facts) { { :osfamily => 'WierdOS'} }
    it 'should fail' do
      expect {
        should contain_class(subject)
      }.to raise_error(Puppet::Error,/supports osfamilies RedHat, Suse and Ubuntu/)
    end
  end

  [true,false,'true','false'].each do |value|
    describe "with deprecated parameter enable_cron set to #{value} (as #{value.class})" do
      let (:params) { { :enable_cron => value} }

      it { should contain_notify('*** DEPRECATION WARNING***: $enable_cron was renamed to $service_enable. Please update your configuration. Support for $enable_cron will be removed in the near future!') }
      it { should contain_service('cron').with_enable(value) }
    end
  end

  ['running','stopped'].each do |value|
    describe "with deprecated parameter ensure_state set to #{value}" do
      let (:params) { { :ensure_state => value} }

      it { should contain_notify('*** DEPRECATION WARNING***: $ensure_state was renamed to $service_ensure. Please update your configuration. Support for $ensure_state will be removed in the near future!') }
      it { should contain_service('cron').with_ensure(value) }
    end
  end

  describe 'variable type and content validations' do
    # set needed custom facts and variables
    let(:facts) { {
      :osfamily               => 'RedHat',
      :operatingsystemrelease => '6.7',
    } }
    let(:validation_params) { {
#      :param => 'value',
    } }

    validations = {
      'absolute_path' => {
        :name    => ['cron_allow_path','cron_deny_path','crontab_path','cron_d_path','cron_hourly_path','cron_daily_path','cron_weekly_path','cron_monthly_path'],
        :valid   => ['/absolute/filepath','/absolute/directory/'],
        :invalid => ['./invalid',['array'],a={'ha'=>'sh'},3,2.42,true,false,nil],
        :message => 'is not an absolute path',
      },
      'array' => {
        :name    => ['cron_allow_users','cron_deny_users'],
        :valid   => [['array'],['val','id']],
        :invalid => ['string',inv={'al'=>'id'},3,2.42,true,false,nil],
        :message => 'is not an Array',
      },
      'array/string' => {
        :name    => ['package_name', 'periodic_jobs_content'],
        :valid   => [['array'],['val','id'],'string'],
        :invalid => [inv={'al'=>'id'},3,2.42,true,false],
        :message => 'is not a string nor an array',
      },
      'boolean / stringified' => {
        :name    => %w(periodic_jobs_manage),
        :valid   => [true, 'true', false, 'false'],
        :invalid => ['string', %w(array), { 'ha' => 'sh' }, 3, 2.42, nil],
        :message => '(Unknown type of boolean given|Requires either string to work with)',
      },
      'hash' => {
        :name    => ['cron_files'],
        :valid   => ['a'=>{'type'=>'d'}],
        :invalid => ['string',['array'],3,2.42,true,false,nil],
        :message => 'is not a Hash',
      },
      'hash_nested_array' => {
        :name    => ['crontab_tasks','crontab_vars'],
        :valid   => [a={'hash'=>['with','nested','array']} ],
        :invalid => ['string',['array'],3,2.42,true,false,nil],
        :message => 'is not a Hash',
      },
      'regex_file_ensure' => {
        :name    => ['cron_allow','cron_deny'],
        :valid   => ['absent','file','present'],
        :invalid => ['invalid','directory','link',['array'],a={'ha'=>'sh'},3,2.42,true,false,nil],
        :message => 'must be absent, file or present',
      },
      'regex_file_mode' => {
        :name    => ['crontab_mode','cron_dir_mode','cron_allow_mode','cron_deny_mode'],
        :valid   => ['0755','0644','0242'],
        :invalid => ['invalid','755',0755,'0980',['array'],a={'ha'=>'sh'},3,2.42,true,false,nil],
        :message => 'must be a valid four digit mode in octal notation',
      },
      'regex_package_ensure' => {
        :name    => ['package_ensure'],
        :valid   => ['present','installed','absent'],
        :invalid => ['invalid','purged','held','latest',['array'],a={'ha'=>'sh'},3,2.42,true,false,nil],
        :message => 'must be absent, present or installed',
      },
      'regex_service_enable' => {
        :name    => ['service_enable'],
        :valid   => ['true','false',true,false],
        :invalid => ['invalid',['array'],a={'ha'=>'sh'},3,2.42,nil],
        :message => 'must be true or false',
      },
      'regex_service_ensure' => {
        :name    => ['service_ensure'],
        :valid   => ['stopped','running'],
        :invalid => ['invalid','true','false',['array'],a={'ha'=>'sh'},3,2.42,true,false,nil],
        :message => 'must be running or stopped',
      },
      'string' => {
        :name    => ['crontab_owner','cron_allow_owner','cron_deny_owner','cron_dir_owner','crontab_group','cron_allow_group','cron_deny_group','cron_dir_group'],
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
