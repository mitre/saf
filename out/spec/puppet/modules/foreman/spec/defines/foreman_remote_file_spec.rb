# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::remote_file' do
  let(:title) { '/tmp/a' }
  let(:params) { {:remote_location => 'file:///tmp/a', :mode => '0664'} }

  it 'should download file' do
    should contain_exec('retrieve_/tmp/a').
               with_command('/usr/bin/curl -s file:///tmp/a -o /tmp/a').
               with_creates('/tmp/a').
               with_timeout(0)
  end

  it 'should set correct mode' do
    should contain_file('/tmp/a').with_mode('0664')
  end
end
