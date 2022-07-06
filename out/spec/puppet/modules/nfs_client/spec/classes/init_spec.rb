# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'nfs_client' do

  context 'with defaults for all parameters' do
    it { should contain_class('nfs_client') }
  end
end
