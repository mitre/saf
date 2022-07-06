# -*- encoding : utf-8 -*-
Puppet::Type.newtype(:foreman_hostgroup) do
  desc 'foreman_hostgroup registers a hostgroup in foreman.'

  ensurable

  newparam(:name, :namevar => true) do
    desc 'The name of the hostgroup.'
    isrequired
  end

  newproperty(:environment) do
    desc 'The name of the environment to set as default for the hostgroup.'
  end

  newproperty(:parent) do
    desc 'The name of the parent hostgroup for this hostgroup.'
  end

  newproperty(:locations, :array_matching => :all) do
    desc 'The name of the locations for this hostgroup.'
  end

  newproperty(:organizations, :array_matching => :all) do
    desc 'The name of the organizations for this hostgroup.'
  end

  newproperty(:puppetmaster) do
    desc 'The name of the puppetmaster smartproxy to set as default for the hostgroup.'
  end

  newproperty(:puppet_ca) do
    desc 'The name of the puppet CA smartproxy to set as default for the hostgroup.'
  end

  newproperty(:puppetclass, :array_matching => :all) do
    desc 'Puppetclasses to associate with this hostgroup.'
  end

  newparam(:base_url) do
    desc 'Foreman\'s base url.'
    defaultto "https://localhost"
  end

  newparam(:effective_user) do
    desc 'Foreman\'s effective user for the registration (usually admin).'
    defaultto "admin"
  end

  newparam(:consumer_key) do
    desc 'Foreman oauth consumer_key'
  end

  newparam(:consumer_secret) do
    desc 'Foreman oauth consumer_secret'
  end

  newparam(:timeout) do
    desc "Timeout for HTTP(s) requests"

    munge do |value|
      value = value.shift if value.is_a?(Array)
      begin
        value = Integer(value)
      rescue ArgumentError
        raise ArgumentError, "The timeout must be a number.", $!.backtrace
      end
      [value, 0].max
    end

    defaultto 500
  end

  def refresh
    provider.refresh_features! if provider.respond_to?(:refresh_features!)
  end

end
