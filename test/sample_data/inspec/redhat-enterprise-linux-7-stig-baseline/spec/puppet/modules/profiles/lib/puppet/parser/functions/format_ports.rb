# -*- encoding : utf-8 -*-
module Puppet::Parser::Functions
  newfunction(:format_ports, :type => :rvalue) do |args|
    new_array = []
    ports = args[0]
    ports.each do |port|
      parts = port.split('/')
      tmp_hash = {"port"=>parts[0], "protocol"=>parts[1]}
      new_array.push(tmp_hash) 
    end
    new_array
  end
end
