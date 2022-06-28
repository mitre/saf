# -*- encoding : utf-8 -*-
begin
  require 'facter/util/sssd'
rescue LoadError
  # Puppet 2 compatibility, facter/ dir is the load path, not lib/
  require 'util/sssd'
end

if defined? Facter::Util::Sssd
  # == Fact: default_ipa_realm
  # == Fact: default_ipa_server
  # == Fact: sssd_services
  # == Fact: sssd_ldap_user_extra_attrs
  # == Fact: sssd_allowed_uids
  # == Fact: sssd_user_attributes
  #
  Facter.add(:default_ipa_realm) do
    setcode do
      Facter::Util::Sssd.ipa_value('global/realm')
    end
  end
  Facter.add(:default_ipa_server) do
    setcode do
      Facter::Util::Sssd.ipa_value('global/server')
    end
  end
  Facter.add(:sssd_services) do
    setcode do
      Facter::Util::Sssd.sssd_value('target[.="sssd"]/services')
    end
  end
  Facter.add(:sssd_ldap_user_extra_attrs) do
    setcode do
      Facter::Util::Sssd.sssd_value('target[.=~regexp("domain/.*")][1]/ldap_user_extra_attrs')
    end
  end
  Facter.add(:sssd_allowed_uids) do
    setcode do
      Facter::Util::Sssd.sssd_value('target[.="ifp"]/allowed_uids')
    end
  end
  Facter.add(:sssd_user_attributes) do
    setcode do
      Facter::Util::Sssd.sssd_value('target[.="ifp"]/user_attributes')
    end
  end
end
