# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'krb5_client' do

  context 'with defaults for all parameters' do
    it { should contain_class('krb5_client') }
  end
end
