# -*- encoding : utf-8 -*-
require 'puppet'

Puppet::Type.newtype(:firewalld_direct_rule) do

  @doc =%q{Allow to pass rules directly to iptables/ip6tables/ebtables using firewalld direct interface.

    Example:

        firewalld_direct_rule {'Allow outgoing SSH connection':
            ensure         => 'present',
            inet_protocol  => 'ipv4',
            table          => 'filter',
            chain          => 'OUTPUT',
            priority       => 1,
            args           => '-p tcp --dport=22 -j ACCEPT',
        }

  }

  ensurable

  newparam(:name, :namevar => :true) do
    desc "Name of the rule resource in Puppet"
  end

  newparam(:inet_protocol) do
    desc "Name of the TCP/IP protocol to use (e.g: ipv4, ipv6)"
    newvalues('ipv4','ipv6')
    defaultto('ipv4')
    munge do |value|
      value.to_s
    end
  end

  newparam(:table) do
    desc "Name of the table type to add (e.g: filter, nat, mangle, raw)"
  end

  newparam(:chain) do
    desc "Name of the chain type to add (e.g: INPUT, OUTPUT, FORWARD)"
  end

  newparam(:priority) do
    desc "The priority number of the rule (e.g: 0, 1, 2, ... 99)"
  end

  newparam(:args) do
    desc "<args> can be all iptables, ip6tables and ebtables command line arguments"
  end

end
