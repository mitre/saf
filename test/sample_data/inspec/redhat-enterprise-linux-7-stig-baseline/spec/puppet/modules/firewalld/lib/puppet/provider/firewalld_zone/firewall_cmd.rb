# -*- encoding : utf-8 -*-
require 'puppet'
require 'puppet/type'
require File.join(File.dirname(__FILE__), '..', 'firewalld.rb')


Puppet::Type.type(:firewalld_zone).provide(
  :firewall_cmd,
  :parent  => Puppet::Provider::Firewalld
) do
  desc "Interact with firewall-cmd"


  def exists?
    @resource[:zone] = @resource[:name]
    execute_firewall_cmd(['--get-zones'], nil).split(" ").include?(@resource[:name])
  end

  def create
    self.debug("Creating new zone #{@resource[:name]} with target: '#{@resource[:target]}'")
    execute_firewall_cmd(['--new-zone', @resource[:name]], nil)

    self.target=(@resource[:target]) if @resource[:target]
    self.sources=(@resource[:sources]) if @resource[:sources]
    self.interfaces=@resource[:interfaces]
  end

  def destroy
    self.debug("Deleting zone #{@resource[:name]}")
    execute_firewall_cmd(['--delete-zone', @resource[:name]], nil)
  end

  def target
    zone_target=execute_firewall_cmd(['--get-target']).chomp
    # The firewall-cmd may or may not return the target surrounded by
    # %% depending on the version. See:
    # https://github.com/crayfishx/puppet-firewalld/issues/111
    return @resource[:target] if @resource[:target].delete('%') == zone_target
    zone_target
  end

  def target=(t)
    self.debug("Setting target for zone #{@resource[:name]} to #{@resource[:target]}")
    execute_firewall_cmd(['--set-target', @resource[:target]])
  end

  def interfaces
    execute_firewall_cmd(['--list-interfaces']).chomp.split(" ") || []
  end

  def interfaces=(new_interfaces)
    new_interfaces ||= []
    cur_interfaces = self.interfaces
    (new_interfaces - cur_interfaces).each do |i|
      self.debug("Adding interface '#{i}' to zone #{@resource[:name]}")
      execute_firewall_cmd(['--add-interface', i])
    end
    (cur_interfaces - new_interfaces).each do |i|
      self.debug("Removing interface '#{i}' from zone #{@resource[:name]}")
      execute_firewall_cmd(['--remove-interface', i])

    end
  end

  def sources
    execute_firewall_cmd(['--list-sources']).chomp.split(" ") || []
  end

  def sources=(new_sources)
    new_sources ||= []
    cur_sources = self.sources
    (new_sources - cur_sources).each do |s|
      self.debug("Adding source '#{s}' to zone #{@resource[:name]}")
      execute_firewall_cmd(['--add-source', s])
    end
    (cur_sources - new_sources).each do |s|
      self.debug("Removing source '#{s}' from zone #{@resource[:name]}")
      execute_firewall_cmd(['--remove-source', s])
    end
  end

  def masquerade
    if execute_firewall_cmd(['--query-masquerade'], @resource[:name], true, false).chomp == 'yes'
      return :true
    else
      return :false
    end
  end

  def masquerade=(bool)
    case bool
    when :true
      execute_firewall_cmd(['--add-masquerade'])
    when :false
      execute_firewall_cmd(['--remove-masquerade'])
    end
  end

  def icmp_blocks
    get_icmp_blocks()
  end

  def icmp_blocks=(i)
    set_blocks = Array.new
    remove_blocks = Array.new

    case i
    when Array then
      get_icmp_blocks.each do |remove_block|
        if !i.include?(remove_block)
          self.debug("removing block #{remove_block} from zone #{@resource[:name]}")
          remove_blocks.push(remove_block)
        end
      end

      i.each do |block|
        if block.is_a?(String)
          if get_icmp_types().include?(block)
            self.debug("adding block #{block} to zone #{@resource[:name]}")
            set_blocks.push(block)
          else
            valid_types = get_icmp_types().join(', ')
            raise Puppet::Error, "#{block} is not a valid icmp type on this system! Valid types are: #{valid_types}"
          end
        else
          raise Puppet::Error, "parameter icmp_blocks must be a string or array of strings!"
        end
      end
    when String then
      get_icmp_blocks.reject { |x| x == i }.each do |remove_block|
        self.debug("removing block #{remove_block} from zone #{@resource[:name]}")
        remove_blocks.push(remove_block)
      end
      if get_icmp_types().include?(i)
        self.debug("adding block #{i} to zone #{@resource[:name]}")
        set_blocks.push(i)
      else
        valid_types = get_icmp_types().join(', ')
        raise Puppet::Error, "#{i} is not a valid icmp type on this system! Valid types are: #{valid_types}"
      end
    else
      raise Puppet::Error, "parameter icmp_blocks must be a string or array of strings!"
    end
    if !remove_blocks.empty?
      remove_blocks.each do |block|
        execute_firewall_cmd(['--remove-icmp-block', block])

      end
    end
    if !set_blocks.empty?
      set_blocks.each do |block|
        execute_firewall_cmd(['--add-icmp-block', block])
      end
    end
  end

  def get_rules
    perm = execute_firewall_cmd(['--list-rich-rules']).split(/\n/)
    curr = execute_firewall_cmd(['--list-rich-rules'], @resource[:name], false).split(/\n/)
    [ perm, curr ].flatten.uniq
  end

  def get_services
    perm = execute_firewall_cmd(['--list-services']).split(' ')
    curr = execute_firewall_cmd(['--list-services'], @resource[:name], false).split(' ')
    [ perm, curr ].flatten.uniq
  end

  def get_ports
    perm = execute_firewall_cmd(['--list-ports']).split(' ')
    curr = execute_firewall_cmd(['--list-ports'], @resource[:name], false).split(' ')

    [ perm, curr ].flatten.uniq.map do |entry|
      port,protocol = entry.split(/\//)
      self.debug("get_ports() Found port #{port} protocol #{protocol}")
      { "port" => port, "protocol" => protocol }
    end
  end

  def get_icmp_blocks
    execute_firewall_cmd(['--list-icmp-blocks']).split(' ').sort
  end

  def get_icmp_types
    execute_firewall_cmd(['--get-icmptypes'], nil).split(' ')
  end

end

