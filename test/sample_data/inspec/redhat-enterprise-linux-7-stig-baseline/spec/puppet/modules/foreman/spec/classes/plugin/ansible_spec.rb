# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'foreman::plugin::ansible' do
  include_examples 'basic foreman plugin tests', 'ansible'
  it { should contain_foreman__plugin('tasks') }
end
