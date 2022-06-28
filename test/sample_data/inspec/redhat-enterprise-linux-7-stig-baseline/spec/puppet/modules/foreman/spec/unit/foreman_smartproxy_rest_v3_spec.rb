# -*- encoding : utf-8 -*-
require 'spec_helper'

provider_class = Puppet::Type.type(:foreman_smartproxy).provider(:rest_v3)
describe provider_class do
  let(:resource) do
    Puppet::Type.type(:foreman_smartproxy).new(
      :name => 'proxy.example.com',
      :url => 'https://proxy.example.com:8443',
      :base_url => 'https://foreman.example.com',
      :consumer_key => 'oauth_key',
      :consumer_secret => 'oauth_secret',
      :effective_user => 'admin'
    )
  end

  let(:provider) do
    provider = provider_class.new
    provider.resource = resource
    provider
  end

  describe '#create' do
    it 'sends POST request' do
      provider.expects(:request).with(:post, 'api/v2/smart_proxies', {}, is_a(String)).returns(mock(:code => '201'))
      provider.create
    end
  end

  describe '#destroy' do
    it 'sends DELETE request' do
      provider.expects(:id).returns(1)
      provider.expects(:request).with(:delete, 'api/v2/smart_proxies/1').returns(mock(:code => '200'))
      provider.destroy
    end
  end

  describe '#exists?' do
    it 'returns true when ID is present' do
      provider.expects(:id).returns(1)
      expect(provider.exists?).to be true
    end

    it 'returns nil when ID is absent' do
      provider.expects(:id).returns(nil)
      expect(provider.exists?).to be false
    end
  end

  describe '#id' do
    it 'returns ID from proxy hash' do
      provider.expects(:proxy).twice.returns({'id' => 1, 'name' => 'proxy.example.com'})
      expect(provider.id).to eq(1)
    end

    it 'returns nil when proxy is absent' do
      provider.expects(:proxy).returns(nil)
      expect(provider.id).to be_nil
    end
  end

  describe '#proxy' do
    it 'returns proxy hash from API results' do
      provider.expects(:request).with(:get, 'api/v2/smart_proxies', :search => 'name="proxy.example.com"').returns(
        mock('response', :body => {:results => [{:id => 1, :name => 'proxy.example.com'}]}.to_json, :code => '200')
      )
      expect(provider.proxy['id']).to eq(1)
      expect(provider.proxy['name']).to eq('proxy.example.com')
    end
  end

  describe '#refresh_features!' do
    it 'sends PUT request to /refresh' do
      provider.expects(:id).returns(1)
      provider.expects(:request).with(:put, 'api/v2/smart_proxies/1/refresh').returns(mock(:code => '200'))
      provider.refresh_features!
    end
  end

  describe '#url' do
    it 'returns ID from proxy hash' do
      provider.expects(:proxy).twice.returns({'id' => 1, 'url' => 'https://proxy.example.com:8443'})
      expect(provider.url).to eq('https://proxy.example.com:8443')
    end

    it 'returns nil when proxy is absent' do
      provider.expects(:proxy).returns(nil)
      expect(provider.url).to be_nil
    end
  end

  describe '#url=' do
    it 'sends PUT request' do
      provider.expects(:id).returns(1)
      provider.expects(:request).with(:put, 'api/v2/smart_proxies/1', {}, includes('"url":"https://new.example.com:8443"')).returns(mock(:code => '200'))
      provider.url = 'https://new.example.com:8443'
    end
  end
end
