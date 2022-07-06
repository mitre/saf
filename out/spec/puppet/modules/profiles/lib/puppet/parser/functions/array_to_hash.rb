# -*- encoding : utf-8 -*-
module Puppet::Parser::Functions
  newfunction(:array_to_hash, :type => :rvalue) do |args|
    new_hash = {}
    raise 'Input argument must be an array.' if not args[0].is_a? Array

    args[0].each do |nkey|
      if nkey.is_a? String
        new_hash[nkey] = {}
      elsif nkey.is_a? Hash
        nkey_keys = nkey.keys
        raise 'Array hash members can only contain one key.' if nkey_keys.size > 1
        key_name = nkey_keys[0]
        raise 'Array hash members must map to a hash only.' if not nkey[key_name].is_a? Hash
        new_hash[key_name] = nkey[key_name]
      else
        raise 'Array members can only be strings or a hash of hashes.'
      end
    end
    new_hash
  end
end
