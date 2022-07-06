# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::plugin::salt' do
  include_examples 'basic foreman plugin tests', 'salt'
  it { should contain_foreman__plugin('tasks') }
end
