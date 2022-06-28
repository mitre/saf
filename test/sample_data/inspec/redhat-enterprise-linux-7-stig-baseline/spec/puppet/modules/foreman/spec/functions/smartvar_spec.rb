# -*- encoding : utf-8 -*-
require 'spec_helper'

describe 'smartvar' do
  it 'should exist' do
    expect(Puppet::Parser::Functions.function('smartvar')).to eq 'function_smartvar'
  end

  it 'should throw an error with no arguments' do
    is_expected.to run.with_params().and_raise_error(Puppet::ParseError)
  end

  # TODO: Test functionality of the actual function.

end
