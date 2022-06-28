# -*- encoding : utf-8 -*-
# Query Foreman
#
# The foreman() parser takes a hash value with parameters to execute the query.
#
# To use foreman(), first create a hash. This sample hash will contain
# parameters to let us get a list of 'hosts' that match our search parameters.
#
# $f = { item         => 'hosts',
#        search       => 'hostgroup=Grid',
#        per_page     => '20',
#        foreman_url  => 'https://foreman',
#        foreman_user => 'my_api_foreman_user',
#        foreman_pass => 'my_api_foreman_pass' }
#
# 'item' may be: environments, fact_values, hosts, hostgroups, puppetclasses, smart_proxies, subnets
# 'search' is your actual search query.
# 'per_page' specifies the maximum number of results you'd like to receive.
#            This defaults to '20' which is consistent with what you'd get from
#            Foreman if you didn't specify anything.
# 'foreman_url' is your actual foreman server address
# 'foreman_user' is the username of an account with API access
# 'foreman_pass' is the password of an account with API access
# 'filter_result' string or array with attribites to return
#                 if a string is given foreman() returns an array only with given attributes
#                 in case of an array is given foreman() returns an array of hashes selecting only
#                 attributes given in array
#                 in case of an given hash foreman() returns an array of hashes selecting only
#                 attribute keys given in hash renamed to values of given keys. This can be used
#                 to rename keys in result
# 'timeout' is the Foreman request timeout in seconds as an integer.
#           This defaults to five seconds.
#
# Then, use a variable to capture its output:
# $hosts = foreman($f)
#
# Note: If you're using this in a template, you may be receiving an array of
# hashes. So you might need to use two loops to get the values you need.
#
# Happy Foreman API-ing!

require "net/http"
require "net/https"
require "uri"
require "timeout"

module Puppet::Parser::Functions
  newfunction(:foreman, :type => :rvalue) do |args|
    # parse an args hash
    raise Puppet::ParseError, "Foreman: Must supply a Hash to foreman(), not a #{args[0].class}" unless args[0].is_a? Hash
    args_hash     = args[0]
    item          = args_hash["item"]
    search        = args_hash["search"]
    per_page      = args_hash["per_page"]     || "20"
    foreman_url   = args_hash["foreman_url"]  || "https://localhost" # defaults: all-in-one
    foreman_user  = args_hash["foreman_user"] || "admin"             # has foreman/puppet
    foreman_pass  = args_hash["foreman_pass"] || "changeme"          # on the same box
    filter_result = args_hash['filter_result'] || false
    timeout       = (args_hash['timeout']      || 5).to_i

    # extend this as required
    searchable_items = %w{ environments fact_values hosts hostgroups puppetclasses smart_proxies subnets }
    raise Puppet::ParseError, "Foreman: Invalid item to search on: #{item}, must be one of #{searchable_items.join(", ")}." unless searchable_items.include?(item)
    raise Puppet::ParseError, "Foreman: Invalid filter_result: #{filter_result}, must be a String or an Array" unless filter_result.is_a? String or filter_result.is_a? Array or filter_result.is_a? Hash or filter_result == false

    begin
      path = URI.escape("/api/#{item}?search=#{search}&per_page=#{per_page}")
      uri = URI.parse(foreman_url)

      req = Net::HTTP::Get.new(path)
      req.basic_auth(foreman_user, foreman_pass)
      req['Content-Type'] = 'application/json'
      req['Accept'] = 'application/json'

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true if uri.scheme == 'https'
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE if http.use_ssl?
      results = Timeout::timeout(timeout) { PSON.parse http.request(req).body }
    rescue Exception => e
      raise Puppet::ParseError, "Failed to contact Foreman at #{foreman_url}: #{e}"
    end

    # Filter results
    if filter_result != false and results.has_key?('results')
      filtered_results = Array.new

      if filter_result.is_a? String
        # filter into an array
        results['results'].each do |result|
          if result.has_key?(filter_result)
            filtered_results << result[filter_result]
          end
        end
      elsif filter_result.is_a? Array
        # filter into an array of hashes by given key
        results['results'].each do |result|
          resulthash = Hash.new
          result.each do |key,value|
            if filter_result.include? key
              resulthash[key] = result[key]
            end
          end
          if resulthash != {}
            filtered_results << resulthash
          end
        end
      else
        # filter into an array of hashes while rename keys
        results['results'].each do |result|
          resulthash = Hash.new
          result.each do |key,value|
            if filter_result.include? key
              resulthash[filter_result[key]] = result[key]
            end
          end
          if resulthash != {}
            filtered_results << resulthash
          end
        end
      end
     return filtered_results
    end

    # return unfiltered
    return results
  end
end
