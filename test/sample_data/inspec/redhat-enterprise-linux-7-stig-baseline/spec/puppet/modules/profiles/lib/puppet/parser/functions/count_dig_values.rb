# -*- encoding : utf-8 -*-
module Puppet::Parser::Functions
  newfunction(:count_dig_values, :type => :rvalue) do |args|
    return_counter = 0
    args[0].each do |hash_item|
      hash_part = hash_item
      args[1].each do |hash_test|
        $inter = 'not_found'
        if hash_part.is_a? String
          # If the 'value' is a string attempt to convert to 
          # a hash.
          h1 = function_parsejson([hash_part]) rescue break
        else 
          h1 = hash_part
        end
        # Attempt to resolve test value from input hash
        hash_part = h1.fetch(hash_test) rescue break
        $inter = 'found'
      end
      return_counter += 1 if $inter == 'found'
    end
    return_counter
  end
end
