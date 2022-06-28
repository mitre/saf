# -*- encoding : utf-8 -*-
require 'beaker-rspec/spec_helper'
require 'beaker-rspec/helpers/serverspec'
require 'beaker/puppet_install_helper'

run_puppet_install_helper unless ENV['BEAKER_provision'] == 'no'

RSpec.configure do |c|
  # Project root
  proj_root = File.expand_path(File.join(File.dirname(__FILE__), '..'))

  # Readable test descriptions
  c.formatter = :documentation

  # Configure all nodes in nodeset
  c.before :suite do
    # Install module and dependencies
    puppet_module_install(:source => proj_root, :module_name => 'foreman')
    hosts.each do |host|
      ["puppet-extlib", "puppetlabs-apt"].each do |mod|
        on host, puppet('module', 'install', mod), { :acceptable_exit_codes => [0] }
      end

      if fact_on(host, 'osfamily') == 'RedHat'
        # don't delete downloaded rpm for use with BEAKER_provision=no +
        # BEAKER_destroy=no
        on host, 'sed -i "s/keepcache=.*/keepcache=1/" /etc/yum.conf'
        # refresh check if cache needs refresh on next yum command
        on host, 'yum clean expire-cache'
      end
    end
  end
end

shared_examples 'a idempotent resource' do
  it 'applies with no errors' do
    apply_manifest(pp, catch_failures: true)
  end

  it 'applies a second time without changes' do
    apply_manifest(pp, catch_changes: true)
  end
end
