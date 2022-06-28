# -*- encoding : utf-8 -*-
require 'spec_helper'
require 'oauth'

provider_class = Puppet::Type.type(:foreman_resource).provider(:rest_v3)
describe provider_class do
  let(:resource) do
    mock('resource')
  end

  let(:provider) do
    provider = provider_class.new
    provider.resource = resource
    provider
  end

  describe '#generate_token' do
    it 'returns an OAuth::AccessToken' do
      provider.expects(:oauth_consumer).returns(OAuth::Consumer.new('test', 'test'))
      expect(provider.generate_token).to be_an(OAuth::AccessToken)
    end
  end

  describe '#oauth_consumer' do
    it 'returns an OAuth::Consumer' do
      provider.expects(:oauth_consumer_key).returns('oauth_key')
      provider.expects(:oauth_consumer_secret).returns('oauth_secret')
      resource.expects(:[]).with(:base_url).returns('https://foreman.example.com')
      resource.expects(:[]).with(:ssl_ca).returns('/etc/foreman/ssl/ca.pem')
      resource.expects(:[]).with(:timeout).returns(500)
      consumer = provider.oauth_consumer
      expect(consumer).to be_an(OAuth::Consumer)
      expect(consumer.site).to eq('https://foreman.example.com')
      expect(consumer.options[:ca_file]).to eq('/etc/foreman/ssl/ca.pem')
      expect(consumer.options[:timeout]).to eq(500)
    end
  end

  describe '#oauth_consumer_key' do
    it 'uses resource consumer_key' do
      resource.expects(:[]).twice.with(:consumer_key).returns('oauth_key')
      expect(provider.oauth_consumer_key).to eq('oauth_key')
    end

    it 'uses settings.yaml if resource has no consumer_key' do
      resource.expects(:[]).with(:consumer_key).returns(nil)
      YAML.expects(:load_file).with('/etc/foreman/settings.yaml').returns(:oauth_consumer_key => 'oauth_key')
      expect(provider.oauth_consumer_key).to eq('oauth_key')
    end
  end

  describe '#oauth_consumer_secret' do
    it 'uses resource consumer_secret' do
      resource.expects(:[]).twice.with(:consumer_secret).returns('oauth_secret')
      expect(provider.oauth_consumer_secret).to eq('oauth_secret')
    end

    it 'uses settings.yaml if resource has no consumer_secret' do
      resource.expects(:[]).with(:consumer_secret).returns(nil)
      YAML.expects(:load_file).with('/etc/foreman/settings.yaml').returns(:oauth_consumer_secret => 'oauth_secret')
      expect(provider.oauth_consumer_secret).to eq('oauth_secret')
    end
  end

  describe '#request' do
    before do
      resource.expects(:[]).with(:base_url).returns(base_url)
      resource.expects(:[]).with(:effective_user).returns(effective_user)
      provider.expects(:oauth_consumer).at_least_once.returns(consumer)
    end

    let(:base_url) { 'https://foreman.example.com' }
    let(:consumer) { mock('oauth_consumer') }
    let(:effective_user) { 'admin' }

    it 'makes GET request via consumer and returns response' do
      response = mock(:code => '200')
      consumer.expects(:request).with(:get, 'https://foreman.example.com/api/v2/example', is_a(OAuth::AccessToken), {}, is_a(Hash)).returns(response)
      expect(provider.request(:get, 'api/v2/example')).to eq(response)
    end

    it 'makes PUT request via consumer and returns response' do
      response = mock(:code => '200')
      consumer.expects(:request).with(:put, 'https://foreman.example.com/api/v2/example', is_a(OAuth::AccessToken), {}, nil, is_a(Hash)).returns(response)
      expect(provider.request(:put, 'api/v2/example')).to eq(response)
    end

    it 'specifies foreman_user header' do
      consumer.expects(:request).with(:get, anything, anything, anything, has_entry('foreman_user', 'admin')).returns(mock(:code => '200'))
      provider.request(:get, 'api/v2/example')
    end

    it 'passes parameters' do
      consumer.expects(:request).with(:get, 'https://foreman.example.com/api/v2/example?test=value', anything, anything, anything, anything).returns(mock(:code => '200'))
      provider.request(:get, 'api/v2/example', :test => 'value')
    end

    it 'passes data' do
      consumer.expects(:request).with(:post, anything, anything, anything, 'test', anything).returns(mock(:code => '200'))
      provider.request(:post, 'api/v2/example', {}, 'test')
    end

    it 'merges headers' do
      consumer.expects(:request).with(:get, anything, anything, anything, has_entries('test' => 'value', 'Accept' => 'application/json')).returns(mock(:code => '200'))
      provider.request(:get, 'api/v2/example', {}, nil, {'test' => 'value'})
    end

    describe 'with non-root base URL' do
      let(:base_url) { 'https://foreman.example.com/foreman' }
      it 'concatenates the base and request URLs' do
        consumer.expects(:request).with(:get, 'https://foreman.example.com/foreman/api/v2/example', anything, anything, anything, anything).returns(mock(:code => '200'))
        provider.request(:get, 'api/v2/example')
      end
    end

    it 'retries on timeout' do
      consumer.expects(:request).twice.with(any_parameters).raises(Timeout::Error).then.returns(mock(:code => '200'))
      provider.request(:get, 'api/v2/example')
    end

    it 'fails resource after multiple timeouts' do
      consumer.expects(:request).times(5).with(any_parameters).
        raises(Timeout::Error).then.
        raises(Timeout::Error).then.
        raises(Timeout::Error).then.
        raises(Timeout::Error).then.
        raises(Timeout::Error)
      expect { provider.request(:get, 'api/v2/example') }.to raise_error(Puppet::Error, /Timeout/)
    end

    it 'fails resource with network errors' do
      consumer.expects(:request).raises(Errno::ECONNRESET)
      expect { provider.request(:get, 'api/v2/example') }.to raise_error(Puppet::Error, /Exception/)
    end
  end

  describe '#success?(response)' do
    it 'returns true for response code in 2xx' do
      expect(provider.success?(mock(:code => '256'))).to eq(true)
    end

    it 'returns false for non-2xx response code' do
      expect(provider.success?(mock(:code => '404'))).to eq(false)
    end
  end

  describe '#error_message(response)' do
    it 'returns array of errors from JSON' do
      expect(provider.error_message(mock(:body => '{"error":{"full_messages":["error1","error2"]}}'))).to eq('error1 error2')
    end

    it 'returns message for missing error messages' do
      expect(provider.error_message(mock(:body => '{}', :code => 404))).to eq('unknown error (response 404)')
    end
  end
end
