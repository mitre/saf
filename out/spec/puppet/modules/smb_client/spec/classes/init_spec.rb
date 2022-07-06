# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'smb_client' do

  context 'with defaults for all parameters' do
    it { should contain_class('smb_client') }
  end
end
