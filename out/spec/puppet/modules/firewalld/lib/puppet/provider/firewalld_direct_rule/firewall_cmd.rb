# -*- encoding : utf-8 -*-
require 'puppet'
require File.join(File.dirname(__FILE__), '..', 'firewalld.rb')

Puppet::Type.type(:firewalld_direct_rule).provide(
  :firewall_cmd,
  :parent => Puppet::Provider::Firewalld
) do
  desc "Interact with firewall-cmd"

  def exists?
    @rule_args ||= generate_raw
    output=execute_firewall_cmd(['--direct', '--query-rule', @rule_args], nil, true, false)
    output.include?('yes')
  end

  def create
    @rule_args ||= generate_raw
    execute_firewall_cmd(['--direct', '--add-rule', @rule_args], nil)
  end

  def destroy
    @rule_args ||= generate_raw
    execute_firewall_cmd(['--direct', '--remove-rule', @rule_args], nil)
  end


  def generate_raw
    rule = []
    rule << [
      @resource[:inet_protocol],
      @resource[:table],
      @resource[:chain],
      @resource[:priority].to_s,
      parse_args(@resource[:args])
    ]
    rule.flatten
  end

end
