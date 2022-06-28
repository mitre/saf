# -*- encoding : utf-8 -*-
module Puppet::Parser::Functions
  newfunction(:count_items_in_array_of_hashes, :type => :rvalue) do |args|
    outCount = 0
    arr = args[0]
    arr.each do |h1|
      outCount = outCount + h1.length
    end
    outCount
  end
end
