# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'pam_stig' do

  context 'with defaults for all parameters' do
    it { should contain_class('pam_stig') }
  end
end
