# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'selinux' do

  context 'with defaults for all parameters' do
    it { should contain_class('selinux') }
  end
end
