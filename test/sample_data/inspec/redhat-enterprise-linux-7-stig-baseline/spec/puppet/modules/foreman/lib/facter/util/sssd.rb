# -*- encoding : utf-8 -*-
begin
  require 'augeas'

  module Facter::Util::Sssd
    def self.aug_value(lens, file, path)
      Augeas::open(nil, nil, Augeas::NO_MODL_AUTOLOAD) do |aug|
        aug.transform(:lens => lens, :incl => file)
        aug.load
        aug.set('/augeas/context', "/files#{file}")
        aug.get(path)
      end
    end

    def self.ipa_value(path)
      aug_value('Puppet.lns', '/etc/ipa/default.conf', path)
    end

    def self.sssd_value(path)
      aug_value('Sssd.lns', '/etc/sssd/sssd.conf', path)
    end
  end
rescue LoadError => e
  Facter.debug("Cannot load Augeas library for custom facts: #{e}")
end
