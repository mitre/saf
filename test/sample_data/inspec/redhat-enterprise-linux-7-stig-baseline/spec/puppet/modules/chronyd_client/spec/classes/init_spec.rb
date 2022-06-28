# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'chronyd_client' do

  context 'with defaults for all parameters' do
    it { should contain_class('chronyd_client') }
  end
end
