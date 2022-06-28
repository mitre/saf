# -*- encoding : utf-8 -*-
require 'puppet'
require File.join(File.dirname(__FILE__), '..', 'firewalld.rb')

Puppet::Type.type(:firewalld_direct_purge).provide(
  :firewall_cmd,
  :parent => Puppet::Provider::Firewalld
) do
  desc "Meta provider to the firewalld_direct_purge type"

  def get_instances_of(restype)
    raise Puppet::Error, "Unknown type #{restype}" unless [:chain, :passthrough, :rule].include?(restype)
    perm = execute_firewall_cmd(['--direct',"--get-all-#{restype.to_s}s"], nil).split(/\n/)
    curr = execute_firewall_cmd(['--direct',"--get-all-#{restype.to_s}s"], nil, false).split(/\n/)
    [ perm, curr ].flatten.uniq
  end

  def purge_resources(restype, args)
    raise Puppet::Error, "Unknown type #{restype}" unless [:chain, :passthrough, :rule].include?(restype)
    execute_firewall_cmd(['--direct', "--remove-#{restype.to_s}", parse_args(args)], nil)
  end

end
