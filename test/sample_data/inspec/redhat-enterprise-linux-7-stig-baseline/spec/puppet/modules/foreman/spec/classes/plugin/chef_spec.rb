# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::plugin::chef' do
  include_examples 'basic foreman plugin tests', 'chef'
  it { should contain_foreman__plugin('tasks') }
end
