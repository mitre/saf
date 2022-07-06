# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'firewalld' do

  context 'with defaults for all parameters' do
    it { should contain_class('firewalld') }
  end
end
