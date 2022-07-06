# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::plugin::discovery' do
  on_os_under_test.each do |os, facts|
    context "on #{os}" do
      let(:facts) { facts }

      let(:pre_condition) { 'include foreman' }

      case facts[:operatingsystem]
        when 'Debian'
          tftproot = '/srv/tftp'
        when 'FreeBSD'
          tftproot = '/tftpboot'
        else
          tftproot = '/var/lib/tftpboot'
      end

      describe 'without paramaters' do
        it { should compile.with_all_deps }
        it { should contain_foreman__plugin('discovery') }
        it { should_not contain_foreman__remote_file("#{tftproot}/boot/fdi-image-latest.tar") }
      end

      describe 'with install_images => true' do
        let :params do
          {
            :install_images => true
          }
        end

        it { should compile.with_all_deps }
        it { should contain_foreman__plugin('discovery') }

        it 'should download and install tarball' do
          should contain_foreman__remote_file("#{tftproot}/boot/fdi-image-latest.tar").
            with_remote_location('http://downloads.theforeman.org/discovery/releases/latest/fdi-image-latest.tar')
        end

        it 'should extract the tarball' do
          should contain_exec('untar fdi-image-latest.tar').with({
            'command' => 'tar xf fdi-image-latest.tar',
            'path' => '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            'cwd' => "#{tftproot}/boot",
            'creates' => "#{tftproot}/boot/fdi-image/initrd0.img",
          })
        end
      end
    end
  end
end
