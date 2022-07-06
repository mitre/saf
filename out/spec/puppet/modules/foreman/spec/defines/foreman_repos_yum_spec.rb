# -*- encoding : utf-8 -*-
require 'spec_helper'


describe 'foreman::repos::yum' do
  let(:title) { 'foreman' }

  context 'with repo => stable' do
    context 'with gpgcheck => true' do
      let(:params) { {:repo => 'stable', :yumcode => 'el6', :gpgcheck => true} }

      it 'should contain repo, plugins and source repo' do
        should contain_yumrepo('foreman').with({
          :descr    => 'Foreman stable',
          :baseurl  => 'http://yum.theforeman.org/releases/latest/el6/$basearch',
          :gpgcheck => '1',
          :gpgkey   => 'https://yum.theforeman.org/releases/latest/RPM-GPG-KEY-foreman',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-source').with({
          :descr    => 'Foreman stable - source',
          :baseurl  => 'http://yum.theforeman.org/releases/latest/el6/source',
          :gpgcheck => '1',
          :gpgkey   => 'https://yum.theforeman.org/releases/latest/RPM-GPG-KEY-foreman',
          :enabled  => '0',
        })

        should contain_yumrepo('foreman-plugins').with({
          :descr    => 'Foreman plugins stable',
          :baseurl  => 'http://yum.theforeman.org/plugins/latest/el6/$basearch',
          :gpgcheck => '0',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-plugins-source').with({
          :descr    => 'Foreman plugins stable - source',
          :baseurl  => 'http://yum.theforeman.org/plugins/latest/el6/source',
          :gpgcheck => '0',
          :enabled  => '0',
        })

      end
    end

    context 'with gpgcheck => false' do
      let(:params) { {:repo => 'stable', :yumcode => 'el6', :gpgcheck => false} }

      it 'should contain repo, plugins and source repo' do
        should contain_yumrepo('foreman').with({
          :descr    => 'Foreman stable',
          :baseurl  => 'http://yum.theforeman.org/releases/latest/el6/$basearch',
          :gpgcheck => '0',
          :gpgkey   => 'https://yum.theforeman.org/releases/latest/RPM-GPG-KEY-foreman',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-source').with({
          :descr    => 'Foreman stable - source',
          :baseurl  => 'http://yum.theforeman.org/releases/latest/el6/source',
          :gpgcheck => '0',
          :gpgkey   => 'https://yum.theforeman.org/releases/latest/RPM-GPG-KEY-foreman',
          :enabled  => '0',
        })

        should contain_yumrepo('foreman-plugins').with({
          :descr    => 'Foreman plugins stable',
          :baseurl  => 'http://yum.theforeman.org/plugins/latest/el6/$basearch',
          :gpgcheck => '0',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-plugins-source').with({
          :descr    => 'Foreman plugins stable - source',
          :baseurl  => 'http://yum.theforeman.org/plugins/latest/el6/source',
          :gpgcheck => '0',
          :enabled  => '0',
        })
      end
    end
  end

  context 'with repo => nightly' do
    context 'gpgcheck => true' do
      let(:params) { {:repo => 'nightly', :yumcode => 'el6', :gpgcheck => true} }

      it 'should contain repo, plugins and source repo' do
        should contain_yumrepo('foreman').with({
          :descr    => 'Foreman nightly',
          :baseurl  => 'http://yum.theforeman.org/nightly/el6/$basearch',
          :gpgcheck => '0',
          :gpgkey   => 'https://yum.theforeman.org/nightly/RPM-GPG-KEY-foreman',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-source').with({
          :descr    => 'Foreman nightly - source',
          :baseurl  => 'http://yum.theforeman.org/nightly/el6/source',
          :gpgcheck => '0',
          :gpgkey   => 'https://yum.theforeman.org/nightly/RPM-GPG-KEY-foreman',
          :enabled  => '0',
        })

        should contain_yumrepo('foreman-plugins').with({
          :descr    => 'Foreman plugins nightly',
          :baseurl  => 'http://yum.theforeman.org/plugins/nightly/el6/$basearch',
          :gpgcheck => '0',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-plugins-source').with({
          :descr    => 'Foreman plugins nightly - source',
          :baseurl  => 'http://yum.theforeman.org/plugins/nightly/el6/source',
          :gpgcheck => '0',
          :enabled  => '0',
        })
      end
    end

    context 'gpgcheck => false' do
      let(:params) { {:repo => 'nightly', :yumcode => 'el6', :gpgcheck => false} }

      it 'should contain repo, plugins and source repo' do
        should contain_yumrepo('foreman').with({
          :descr    => 'Foreman nightly',
          :baseurl  => 'http://yum.theforeman.org/nightly/el6/$basearch',
          :gpgcheck => '0',
          :gpgkey   => 'https://yum.theforeman.org/nightly/RPM-GPG-KEY-foreman',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-source').with({
          :descr    => 'Foreman nightly - source',
          :baseurl  => 'http://yum.theforeman.org/nightly/el6/source',
          :gpgcheck => '0',
          :gpgkey   => 'https://yum.theforeman.org/nightly/RPM-GPG-KEY-foreman',
          :enabled  => '0',
        })

        should contain_yumrepo('foreman-plugins').with({
          :descr    => 'Foreman plugins nightly',
          :baseurl  => 'http://yum.theforeman.org/plugins/nightly/el6/$basearch',
          :gpgcheck => '0',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-plugins-source').with({
          :descr    => 'Foreman plugins nightly - source',
          :baseurl  => 'http://yum.theforeman.org/plugins/nightly/el6/source',
          :gpgcheck => '0',
          :enabled  => '0',
        })
      end
    end
  end

  context 'with repo => 1.7' do
    context 'gpgcheck => true' do
      let(:params) { {:repo => '1.7', :yumcode => 'el6', :gpgcheck => true} }

      it 'should contain repo, plugins and source repo' do
        should contain_yumrepo('foreman').with({
          :descr    => 'Foreman 1.7',
          :baseurl  => 'http://yum.theforeman.org/releases/1.7/el6/$basearch',
          :gpgcheck => '1',
          :gpgkey   => 'https://yum.theforeman.org/releases/1.7/RPM-GPG-KEY-foreman',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-source').with({
          :descr    => 'Foreman 1.7 - source',
          :baseurl  => 'http://yum.theforeman.org/releases/1.7/el6/source',
          :gpgcheck => '1',
          :gpgkey   => 'https://yum.theforeman.org/releases/1.7/RPM-GPG-KEY-foreman',
          :enabled  => '0',
        })

        should contain_yumrepo('foreman-plugins').with({
          :descr    => 'Foreman plugins 1.7',
          :baseurl  => 'http://yum.theforeman.org/plugins/1.7/el6/$basearch',
          :gpgcheck => '0',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-plugins-source').with({
          :descr    => 'Foreman plugins 1.7 - source',
          :baseurl  => 'http://yum.theforeman.org/plugins/1.7/el6/source',
          :gpgcheck => '0',
          :enabled  => '0',
        })
      end
    end

    context 'gpgcheck => false' do
      let(:params) { {:repo => '1.7', :yumcode => 'el6', :gpgcheck => false} }

      it 'should contain repo, plugins and source repo' do
        should contain_yumrepo('foreman').with({
          :descr    => 'Foreman 1.7',
          :baseurl  => 'http://yum.theforeman.org/releases/1.7/el6/$basearch',
          :gpgcheck => '0',
          :gpgkey   => 'https://yum.theforeman.org/releases/1.7/RPM-GPG-KEY-foreman',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-source').with({
          :descr    => 'Foreman 1.7 - source',
          :baseurl  => 'http://yum.theforeman.org/releases/1.7/el6/source',
          :gpgcheck => '0',
          :gpgkey   => 'https://yum.theforeman.org/releases/1.7/RPM-GPG-KEY-foreman',
          :enabled  => '0',
        })

        should contain_yumrepo('foreman-plugins').with({
          :descr    => 'Foreman plugins 1.7',
          :baseurl  => 'http://yum.theforeman.org/plugins/1.7/el6/$basearch',
          :gpgcheck => '0',
          :enabled  => '1',
        })

        should contain_yumrepo('foreman-plugins-source').with({
          :descr    => 'Foreman plugins 1.7 - source',
          :baseurl  => 'http://yum.theforeman.org/plugins/1.7/el6/source',
          :gpgcheck => '0',
          :enabled  => '0',
        })
      end
    end
  end
end
