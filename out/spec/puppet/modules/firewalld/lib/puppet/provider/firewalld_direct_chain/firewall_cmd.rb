# -*- encoding : utf-8 -*-
require 'puppet'
require File.join(File.dirname(__FILE__), '..', 'firewalld.rb')

Puppet::Type.type(:firewalld_direct_chain).provide(:firewall_cmd, :parent => Puppet::Provider::Firewalld) do
  desc "Provider for managing firewalld direct chains using firewall-cmd"

  def exists?
    @chain_args ||= generate_raw
    output=execute_firewall_cmd(['--direct', '--query-chain', @chain_args], nil, true, false)
    output.include?('yes')
  end

  def create
    @chain_args ||= generate_raw
    execute_firewall_cmd(['--direct', '--add-chain', @chain_args], nil)
  end

  def destroy
    @chain_args ||= generate_raw
    execute_firewall_cmd(['--direct', '--remove-chain', @chain_args], nil)
  end

  def generate_raw
    chain = []
    chain << [
	    @resource[:inet_protocol],
	    @resource[:table],
	    @resource[:name]
    ]
  end
end
