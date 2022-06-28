# -*- encoding : utf-8 -*-
# Base provider for other Puppet types managing Foreman resources
#
# This provider uses Net::HTTP from Ruby stdlib, JSON (stdlib on 1.9+ or the
# gem on 1.8) and the oauth gem for auth, so requiring minimal dependencies.

require 'uri'

Puppet::Type.type(:foreman_resource).provide(:rest_v3) do
  # when previous providers are installed, use this one
  def self.specificity
    super + 2
  end

  def oauth_consumer_key
    @oauth_consumer_key ||= begin
      if resource[:consumer_key]
        resource[:consumer_key]
      else
        begin
          YAML.load_file('/etc/foreman/settings.yaml')[:oauth_consumer_key]
        rescue
          fail "Resource #{resource[:name]} cannot be managed: No OAuth Consumer Key available"
        end
      end
    end
  end

  def oauth_consumer_secret
    @oauth_consumer_secret ||= begin
      if resource[:consumer_secret]
        resource[:consumer_secret]
      else
        begin
          YAML.load_file('/etc/foreman/settings.yaml')[:oauth_consumer_secret]
        rescue
          fail "Resource #{resource[:name]} cannot be managed: No OAuth consumer secret available"
        end
      end
    end
  end

  def oauth_consumer
    @consumer ||= OAuth::Consumer.new(oauth_consumer_key, oauth_consumer_secret, {
      :site               => resource[:base_url],
      :request_token_path => '',
      :authorize_path     => '',
      :access_token_path  => '',
      :timeout            => resource[:timeout],
      :ca_file            => resource[:ssl_ca]
    })
  end

  def generate_token
    OAuth::AccessToken.new(oauth_consumer)
  end

  def request(method, path, params = {}, data = nil, headers = {})
    base_url = resource[:base_url]
    base_url += '/' unless base_url.end_with?('/')

    uri = URI.join(base_url, path)
    uri.query = params.map { |p,v| "#{URI.escape(p.to_s)}=#{URI.escape(v.to_s)}" }.join('&') unless params.empty?

    headers = {
      'Accept' => 'application/json',
      'Content-Type' => 'application/json',
      'foreman_user' => resource[:effective_user]
    }.merge(headers)

    attempts = 0
    begin
      debug("Making #{method} request to #{uri}")
      if [:post, :put, :patch].include?(method)
        response = oauth_consumer.request(method, uri.to_s, generate_token, {}, data, headers)
      else
        response = oauth_consumer.request(method, uri.to_s, generate_token, {}, headers)
      end
      debug("Received response #{response.code} from request to #{uri}")
      response
    rescue Timeout::Error => te
      attempts = attempts + 1
      if attempts < 5
        warning("Timeout calling API at #{uri}. Retrying ..")
        retry
      else
        raise Puppet::Error.new("Timeout calling API at #{uri}", te)
      end
    rescue Exception => ex
      raise Puppet::Error.new("Exception #{ex} in #{method} request to: #{uri}", ex)
    end
  end

  def success?(response)
    (200..299).include?(response.code.to_i)
  end

  def error_message(response)
    JSON.parse(response.body)['error']['full_messages'].join(' ') rescue "unknown error (response #{response.code})"
  end
end
