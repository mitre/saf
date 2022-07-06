# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'add_ipv6' do

  context 'with defaults for all parameters' do
    it { should contain_class('add_ipv6') }
  end
end
