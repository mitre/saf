# -*- encoding : utf-8 -*-
require 'spec_helper'
require 'webmock'

describe 'foreman' do
  it 'should exist' do
    expect(Puppet::Parser::Functions.function('foreman')).to eq 'function_foreman'
  end

  it 'should throw an error with no arguments' do
    is_expected.to run.with_params().and_raise_error(Puppet::ParseError)
  end
  
  it 'should succeed with no timeout specified' do
    stub_request(:get, "https://my_api_foreman_user:my_api_foreman_pass@foreman.example.com/api/hosts?per_page=20&search=hostgroup=Grid").
      to_return(:status => 200, :body => '{"total":0,"subtotal":0,"page":1,"per_page":20,"search":"hostgroup=Grid","sort":{"by":null,"order":null},"results":[]}', :headers => {})

    is_expected.to run.with_params(
      'item'         => 'hosts',
      'search'       => 'hostgroup=Grid',
      'per_page'     => '20',
      'foreman_url'  => 'https://foreman.example.com',
      'foreman_user' => 'my_api_foreman_user',
      'foreman_pass' => 'my_api_foreman_pass'
    )
  end

  it 'should succeed with a non-default timeout specified' do
    stub_request(:get, "https://my_api_foreman_user:my_api_foreman_pass@foreman.example.com/api/hosts?per_page=20&search=hostgroup=Grid").
      to_return(:status => 200, :body => '{"total":0,"subtotal":0,"page":1,"per_page":20,"search":"hostgroup=Grid","sort":{"by":null,"order":null},"results":[]}', :headers => {})

    is_expected.to run.with_params(
      'item'         => 'hosts',
      'search'       => 'hostgroup=Grid',
      'per_page'     => '20',
      'foreman_url'  => 'https://foreman.example.com',
      'foreman_user' => 'my_api_foreman_user',
      'foreman_pass' => 'my_api_foreman_pass',
      'timeout'      => '15'
    )
  end

  it 'should throw an "execution expired" error when the timeout is exceeded' do
    stub_request(:get, "https://my_api_foreman_user:my_api_foreman_pass@foreman.example.com/api/hosts?per_page=20&search=hostgroup=Grid").
      to_return(body: lambda { |request| sleep(2) ; '{"total":0,"subtotal":0,"page":1,"per_page":20,"search":"hostgroup=Grid","sort":{"by":null,"order":null},"results":[]}' })

    is_expected.to run.with_params(
      'item'         => 'hosts',
      'search'       => 'hostgroup=Grid',
      'per_page'     => '20',
      'foreman_url'  => 'https://foreman.example.com',
      'foreman_user' => 'my_api_foreman_user',
      'foreman_pass' => 'my_api_foreman_pass',
      'timeout'      => '1'
    ).and_raise_error(/execution expired/)
  end
  
  it 'should not throw an "execution expired" error with the default timeout' do
    stub_request(:get, "https://my_api_foreman_user:my_api_foreman_pass@foreman.example.com/api/hosts?per_page=20&search=hostgroup=Grid").
      to_return(body: lambda { |request| sleep(2) ; '{"total":0,"subtotal":0,"page":1,"per_page":20,"search":"hostgroup=Grid","sort":{"by":null,"order":null},"results":[]}' })

    is_expected.to run.with_params(
      'item'         => 'hosts',
      'search'       => 'hostgroup=Grid',
      'per_page'     => '20',
      'foreman_url'  => 'https://foreman.example.com',
      'foreman_user' => 'my_api_foreman_user',
      'foreman_pass' => 'my_api_foreman_pass'
    )
  end

  # TODO: Test functionality of the actual function.

end
