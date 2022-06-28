# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::repos::apt' do
  let(:title) { 'foreman' }

  let :facts do
    on_supported_os['debian-8-x86_64']
  end

  context 'with repo => stable' do
    let(:params) { {:repo => 'stable'} }

    it { should contain_class('apt') }

    it 'should add the stable repo' do
      should contain_apt__source('foreman').
        with_location('http://deb.theforeman.org/').
        with_repos('stable')

      should contain_file('/etc/apt/sources.list.d/foreman.list').
        with_content(/deb http:\/\/deb.theforeman.org\/ jessie stable/)

      should contain_apt__source('foreman-plugins').
        with_location('http://deb.theforeman.org/').
        with_release('plugins').
        with_repos('stable')
    end

    let(:apt_key) do
      'AE0AF310E2EA96B6B6F4BD726F8600B9563278F6'
    end
    let(:apt_key_title) do
      "Add key: #{apt_key} from Apt::Source foreman"
    end

    it { should contain_apt_key(apt_key_title) }
    it { should contain_apt_key(apt_key_title).with_id(apt_key) }
    it { should contain_apt_key(apt_key_title).with_source(/#{apt_key[-16..-1]}/) }
  end

  context 'with repo => 1.11' do
    let(:params) { {:repo => '1.11'} }

    it { should contain_class('apt') }

    it 'should add the 1.11 repo' do
      should contain_apt__source('foreman').
        with_location('http://deb.theforeman.org/').
        with_repos('1.11')

      should contain_file('/etc/apt/sources.list.d/foreman.list').
        with_content(/deb http:\/\/deb.theforeman.org\/ jessie 1.11/)

      should contain_apt__source('foreman-plugins').
        with_location('http://deb.theforeman.org/').
        with_release('plugins').
        with_repos('1.11')
    end
  end

  context 'with repo => nightly' do
    let(:params) { {:repo => 'nightly'} }

    it { should contain_class('apt') }

    it 'should add the nightly repo' do
      should contain_apt__source('foreman').
        with_location('http://deb.theforeman.org/').
        with_repos('nightly')

      should contain_file('/etc/apt/sources.list.d/foreman.list').
        with_content(/deb http:\/\/deb.theforeman.org\/ jessie nightly/)

      should contain_apt__source('foreman-plugins').
        with_location('http://deb.theforeman.org/').
        with_release('plugins').
        with_repos('nightly')
    end
  end

end
