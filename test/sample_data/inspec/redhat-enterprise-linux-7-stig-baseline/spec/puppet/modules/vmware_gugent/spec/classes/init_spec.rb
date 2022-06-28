# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'vmware_gugent' do

  context 'with defaults for all parameters' do
    it { should contain_class('vmware_gugent') }
  end
end
