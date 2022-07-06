# -*- encoding : utf-8 -*-
Puppet::Type.type(:foreman_smartproxy).provide(:rest_v2) do

  confine :feature => :apipie_bindings

  def raise_error(e)
    body = JSON.parse(e.response)["error"]["full_messages"].join(" ") rescue 'N/A'
    fail "Proxy #{resource[:name]} cannot be registered (#{e.message}): #{body}"
  end

  # when both rest and rest_v2 providers are installed, use this one
  def self.specificity
    super + 1
  end

  def api
    if resource[:consumer_key]
      key = resource[:consumer_key]
    else
      begin
        key = YAML.load_file('/etc/foreman/settings.yaml')[:oauth_consumer_key]
      rescue
        fail "Smartproxy #{resource[:name]} cannot be registered: No OAUTH Consumer Key available"
      end
    end

    if resource[:consumer_secret]
      secret = resource[:consumer_secret]
    else
      begin
        secret = YAML.load_file('/etc/foreman/settings.yaml')[:oauth_consumer_secret]
      rescue
        fail "Smartproxy #{resource[:name]} cannot be registered: No OAUTH Consumer Secret available"
      end
    end

    @api ||= ApipieBindings::API.new({
      :uri => resource[:base_url],
      :api_version => 2,
      :oauth => {
        :consumer_key    => key,
        :consumer_secret => secret
      },
      :timeout => resource[:timeout],
      :headers => {
        :foreman_user => resource[:effective_user],
      },
      :apidoc_cache_base_dir => File.join(Puppet[:vardir], 'apipie_bindings')
    }).resource(:smart_proxies)
  end

  # proxy hash or nil
  def proxy
    if @proxy
      @proxy
    else
      @proxy = api.call(:index, :search => "name=\"#{resource[:name]}\"")['results'][0]
    end
  rescue Exception => e
    raise_error e
  end

  def id
    proxy ? proxy['id'] : nil
  end

  def exists?
    ! id.nil?
  end

  def create
    api.call(:create, {
      :smart_proxy => {
        :name => resource[:name],
        :url  => resource[:url]
      }
    })
  rescue Exception => e
    raise_error e
  end

  def destroy
    api.call(:destroy, :id => id)
    @proxy = nil
  rescue Exception => e
    raise_error e
  end

  def url
    proxy ? proxy['url'] : nil
  end

  def url=(value)
    api.call(:update, { :id => id, :smart_proxy => { :url => value } })
  rescue Exception => e
    raise_error e
  end

  def refresh_features!
    api.call(:refresh, :id => id)
  rescue Exception => e
    raise_error e
  end

end
