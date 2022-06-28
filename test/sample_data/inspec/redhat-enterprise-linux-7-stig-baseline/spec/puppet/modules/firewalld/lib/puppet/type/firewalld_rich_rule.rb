# -*- encoding : utf-8 -*-
require 'puppet'

Puppet::Type.newtype(:firewalld_rich_rule) do

  @doc =%q{Manages firewalld rich rules.

    firewalld_rich_rules will autorequire the firewalld_zone specified in the zone parameter so there is no need to add dependancies for this  

    Example:
    
      firewalld_rich_rule { 'Accept SSH from barny':
        ensure => present,
        zone   => 'restricted',
        source => '192.168.1.2/32',
        service => 'ssh',
        action  => 'accept',
      }
  
  }

  ensurable

  newparam(:name) do
    isnamevar
    desc "Name of the rule resource in Puppet"
  end

  newparam(:zone) do
    desc "Name of the zone"
  end

  newparam(:family) do
    desc "IP family, one of ipv4 or ipv6, defauts to ipv4"
    newvalues(:ipv4, :ipv6)
    defaultto :ipv4
    munge do |value|
      value.to_s
    end
  end

  newparam(:source) do
    desc "Specify source address, this can be a string of the IP address or a hash containing other options"
    munge do |value|
      if value.is_a?(String)
        { 'address' => value }
      else
        errormsg = "Only one source type address or ipset may be specified."
        if value.has_key?("address") && value.has_key?("ipset")
          self.fail errormsg
        end
        value
      end
    end
  end
  newparam(:dest) do
    desc "Specify destination address, this can be a string of the IP address or a hash containing other options"
    munge do |value|
      if value.is_a?(String)
        { 'address' => value }
      else
        errormsg = "Only one source type address or ipset may be specified."
        if value.has_key?("address") && value.has_key?("ipset")
          self.fail errormsg
        end
        value
      end
    end
  end

  newparam(:service) do
    desc "Specify the element as a service"
  end

  newparam(:port) do
    desc "Specify the element as a port"
  end

  newparam(:protocol) do
    desc "Specify the element as a protocol"
  end

  newparam(:icmp_block) do
    desc "Specify the element as an icmp-block"
  end

  newparam(:masquerade) do
    desc "Specify the element as masquerade"
  end

  newparam(:forward_port) do
    desc "Specify the element as forward-port"
  end

  newparam(:log) do
    desc "doc"
  end

  newparam(:audit) do
    desc "doc"
  end

  newparam(:action) do
    desc "doc"
  end

  newparam(:raw_rule) do
    desc "Manage the entire rule as one string - this is used internally by firwalld_zone to
          handle pruning of rules"
  end


 
  def elements
    [:service, :port, :protocol, :icmp_block, :masquerade, :forward_port]
  end

  validate do
    errormsg = "Only one element (#{elements.join(',')}) may be specified."
    self.fail errormsg if elements.select { |e| self[e] }.size > 1
  end

  autorequire(:firewalld_zone) do
    self[:zone]
  end

  autorequire(:ipset) do
    self[:source]["ipset"] if self[:source].is_a?(Hash)
  end


end
