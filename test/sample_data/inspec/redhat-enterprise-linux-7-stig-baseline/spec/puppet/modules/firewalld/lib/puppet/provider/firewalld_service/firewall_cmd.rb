# -*- encoding : utf-8 -*-
require 'puppet'
require File.join(File.dirname(__FILE__), '..', 'firewalld.rb')

Puppet::Type.type(:firewalld_service).provide(
  :firewall_cmd,
  :parent => Puppet::Provider::Firewalld
) do
  desc "Interact with firewall-cmd"

  def exists?
    execute_firewall_cmd(['--list-services']).split(" ").include?(@resource[:service])
  end

  def create
    self.debug("Adding new service to firewalld: #{@resource[:service]}")
    execute_firewall_cmd(['--add-service', @resource[:service]])
    reload_firewall
  end

  def destroy
    self.debug("Removing service from firewalld: #{@resource[:service]}")

    if online?
      flag = '--remove-service'
    else
      flag = '--remove-service-from-zone'
    end

    execute_firewall_cmd([flag, @resource[:service]])
    reload_firewall
  end

end
