# -*- encoding : utf-8 -*-
module Puppet::Parser::Functions
  newfunction(:ensure_value_in_string, :type => :rvalue, :doc => <<-EOS
Returns an string with appended values to the end if they were not present in original string.

Prototype:

    ensure_value_in_string(string, array, separator = ',')

Where string is the original string, array is array of additional values to append,
separator is optional specifying delimiter and defaults to a comma.

For example:

  Given the following statements:

    ensure_value_in_string('one,two', ['two', 'three'])

  The result will be as follows:

    'one,two,three'

  You can specify you own separator as a third argument

     ensure_value_in_string('one,two', ['two', 'three'], ', ')

  results in

    'one,two, three'
  EOS
  ) do |*arguments|
    #
    # This is to ensure that whenever we call this function from within
    # the Puppet manifest or alternatively form a template it will always
    # do the right thing ...
    #
    arguments = arguments.shift if arguments.first.is_a?(Array)

    raise Puppet::ParseError, "ensure_value_in_string(): Wrong number of arguments " +
        "given (#{arguments.size} for 2..3)" if arguments.size < 2 or arguments.size > 3

    string = arguments.shift
    raise Puppet::ParseError, "ensure_value_in_string(): First argument is not string but #{string.class.to_s}" unless string.is_a?(String)

    adding = arguments.shift
    raise Puppet::ParseError, "ensure_value_in_string(): Second argument is not array but #{adding.class.to_s}" unless adding.is_a?(Array)

    separator = arguments.shift || ','

    existing = string.split(separator.strip).map(&:strip)
    to_add = adding - existing

    ([ string.empty? ? nil : string ] + to_add).compact.join(separator)
  end
end
