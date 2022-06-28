# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'aide' do

  context 'with defaults for all parameters' do
    it { should contain_class('aide') }
  end
end
