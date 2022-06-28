# -*- encoding : utf-8 -*-
require 'spec_helper'
describe 'autofs' do

  context 'with defaults for all parameters' do
    it { should contain_class('autofs') }
  end
end
