# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'sysctl' do

  context 'with defaults for all parameters' do
    it { should contain_class('sysctl') }
  end
end
