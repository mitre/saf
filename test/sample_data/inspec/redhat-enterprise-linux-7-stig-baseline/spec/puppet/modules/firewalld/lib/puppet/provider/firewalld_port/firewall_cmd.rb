# -*- encoding : utf-8 -*-
require 'puppet'
require File.join(File.dirname(__FILE__), '..', 'firewalld.rb')

Puppet::Type.type(:firewalld_port).provide(
  :firewall_cmd,
  :parent => Puppet::Provider::Firewalld
) do
  desc "Interact with firewall-cmd"
  
  mk_resource_methods
  
  def exists?
    @rule_args ||= build_port_rule
    output=execute_firewall_cmd(['--query-port', @rule_args], @resource[:zone], true, false)
    output.exitstatus == 0
  end
  
  def quote_keyval(key,val)
    val ? "#{key}=\"#{val}\"" : ''
  end
  
  def eval_port
    args = []
    args << "#{@resource[:port]}/#{@resource[:protocol]}"
    args
  end
  
  def build_port_rule
    rule = []
    rule << eval_port
    rule
  end
  
  def create
    execute_firewall_cmd(['--add-port', build_port_rule])
  end
  
  def destroy
    execute_firewall_cmd(['--remove-port', build_port_rule])
  end
  
end
