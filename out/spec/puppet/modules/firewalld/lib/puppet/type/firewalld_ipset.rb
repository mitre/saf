# -*- encoding : utf-8 -*-

Puppet::Type.newtype(:firewalld_ipset) do

  @doc =%q{
    Configure IPsets in Firewalld
    
    Example:
    
        firewalld_port {'Open port 8080 in the public Zone':
            ensure   => 'present',
            zone     => 'public',
            port     => 8080,
            protocol => 'tcp',
        }
  }
  
  ensurable
  
  newparam(:name, :namevar => true) do
    desc "Name of the IPset"
    validate do |val|
      raise Puppet::Error, "IPset name must be a word with no spaces" unless val =~ /^\w+$/
    end
  end
  
  newparam(:type) do
    desc "Type of the ipset (default: hash:ip)"
    defaultto "hash:ip"
  end

  newparam(:options) do
    desc "Hash of options for the IPset, eg { 'family' => 'inet6' }"
    validate do |val|
      raise Puppet::Error, "options must be a hash" unless val.is_a?(Hash)
    end
  end

  newproperty(:entries, :array_matching => :all) do
    desc "Array of ipset entries"
    def insync?(is)
      should.sort == is
    end
  end

end
  
