# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'sudo' do

  context 'with defaults for all parameters' do
    it { should contain_class('sudo') }
  end
end
