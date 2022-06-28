# -*- encoding : utf-8 -*-
require 'puppet'
require 'puppet/parameter/boolean'

Puppet::Type.newtype(:firewalld_direct_purge) do


  # Reference the types here so we know they are loaded.
  #
  Puppet::Type.type(:firewalld_direct_chain)
  Puppet::Type.type(:firewalld_direct_rule)
  Puppet::Type.type(:firewalld_direct_passthrough)

  @doc =%q{Allow to purge direct rules in iptables/ip6tables/ebtables using firewalld direct interface.

    Example:

        firewalld_direct_purge {'chain': }
        firewalld_direct_purge {'passthrough': }
        firewalld_direct_purge {'rule': }

  }

  ensurable do
    defaultto(:purged)
    newvalue(:purgable) do
    end
    newvalue(:purged) do
      true 
    end

      

    def retrieve
      if @resource.purge?
        :purgable
      else
        :purged
      end
    end

  end

  def generate
    @purge_resources = []
    purge_resources if Puppet::Provider::Firewalld.available?
    []
  end

  newparam(:purge) do
    newvalues(:true, :false)
    defaultto(:true)
  end

  newparam(:name, :namevar => true) do
    desc "Type of resource to purge, valid values are 'chain', 'passthrough' and 'rule'"
    newvalues('chain','passthrough','rule')
  end

  def purge?
    @purge_resources.length > 0
  end

  def purge_resources
    resources = []
    resource_type = self[:name].to_sym
    klass = nil

    case resource_type
    when :chain
      klass = Puppet::Type::Firewalld_direct_chain
    when :passthrough
      klass = Puppet::Type::Firewalld_direct_passthrough
    when :rule
      klass = Puppet::Type::Firewalld_direct_rule
    end

    purge_rules = []
    puppet_rules = []

    catalog.resources.select { |r| r.is_a?(klass) }.each do |res|
      unless res.provider.respond_to?(:generate_raw)
        raise Puppet::Error, "Provider for #{resource_type} doesnt support generate_raw method"
      end
      puppet_rules << res.provider.generate_raw.join(' ')
    end

    provider.get_instances_of(resource_type).reject { |i|
      puppet_rules.include?(i)
    }.each do |inst|
      @purge_resources << inst
      unless Puppet.settings[:noop] || self[:noop]
        provider.purge_resources(resource_type, inst.split(/ /))
      end
    end
  end
end
