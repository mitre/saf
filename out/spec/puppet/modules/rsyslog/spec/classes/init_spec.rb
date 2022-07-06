# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'rsyslog' do

  context 'with defaults for all parameters' do
    it { should contain_class('rsyslog') }
  end
end
