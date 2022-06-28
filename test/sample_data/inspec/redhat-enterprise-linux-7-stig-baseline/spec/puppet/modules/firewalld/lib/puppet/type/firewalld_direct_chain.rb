# -*- encoding : utf-8 -*-
require 'puppet'

Puppet::Type.newtype(:firewalld_direct_chain) do

  @doc =%q{Allow to create a custom chain in iptables/ip6tables/ebtables using firewalld direct interface.

    Example:

        firewalld_direct_chain {'Add custom chain LOG_DROPS':
            name           => 'LOG_DROPS',
            ensure         => 'present',
            inet_protocol  => 'ipv4',
            table          => 'filter'
        }

  }

  ensurable

  def self.title_patterns
    [
      [
        /^([^:]+):([^:]+):([^:]+)$/,
        [ [:inet_protocol], [:table], [:name] ]
      ],
      [
        /^([^:]+)$/,
        [[ :name ]]
      ]
    ]
  end

  newparam(:name, :namevar => :true) do
    desc "Name of the chain eg: LOG_DROPS"
  end

  newparam(:inet_protocol) do
    desc "Name of the TCP/IP protocol to use (e.g: ipv4, ipv6)"
    newvalues('ipv4','ipv6')
    defaultto('ipv4')
    munge do |value|
      value.to_s
    end
    isnamevar
  end

  newparam(:table) do
    desc "Name of the table type to add (e.g: filter, nat, mangle, raw)"
    isnamevar
  end

end
