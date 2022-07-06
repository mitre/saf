# -*- encoding : utf-8 -*-
module Puppet::Parser::Functions
  newfunction(:index_of, :type => :rvalue) do |args|
    arr = args[0]
    arr.index(args[1])
  end
end
