# -*- encoding : utf-8 -*-
control "V-72227" do
  title "The Red Hat Enterprise Linux operating system must implement
cryptography to protect the integrity of Lightweight Directory Access Protocol
(LDAP) authentication communications."
  desc  "Without cryptographic integrity protections, information can be
altered by unauthorized users without detection.

    Cryptographic mechanisms used for protecting the integrity of information
include, for example, signed hash functions using asymmetric cryptography
enabling distribution of the public key to verify the hash information while
maintaining the confidentiality of the key used to generate the hash.
  "
  desc  "rationale", ""
  desc  "check", "
    If LDAP is not being utilized, this requirement is Not Applicable.

    Verify the operating system implements cryptography to protect the
integrity of remote LDAP authentication sessions.

    To determine if LDAP is being used for authentication, use the following
command:

    # systemctl status sssd.service
    sssd.service - System Security Services Daemon
    Loaded: loaded (/usr/lib/systemd/system/sssd.service; enabled; vendor
preset: disabled)
    Active: active (running) since Wed 2018-06-27 10:58:11 EST; 1h 50min ago

    If the \"sssd.service\" is \"active\", then LDAP is being used.

    Determine the \"id_provider\" the LDAP is currently using:

    # grep -i \"id_provider\" /etc/sssd/sssd.conf

    id_provider = ad

    If \"id_provider\" is set to \"ad\", this is Not Applicable.

    Ensure that LDAP is configured to use TLS by using the following command:

    # grep -i \"start_tls\" /etc/sssd/sssd.conf
    ldap_id_use_start_tls = true

    If the \"ldap_id_use_start_tls\" option is not \"true\", this is a finding.
  "
  desc  "fix", "
    Configure the operating system to implement cryptography to protect the
integrity of LDAP authentication sessions.

    Add or modify the following line in \"/etc/sssd/sssd.conf\":

    ldap_id_use_start_tls = true
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000250-GPOS-00093"
  tag gid: "V-72227"
  tag rid: "SV-86851r4_rule"
  tag stig_id: "RHEL-07-040180"
  tag fix_id: "F-78581r2_fix"
  tag cci: ["CCI-001453"]
  tag nist: ["AC-17 (2)"]

  sssd_id_ldap_enabled = (package('sssd').installed? and
    !command('grep "^\s*id_provider\s*=\s*ldap" /etc/sssd/sssd.conf').stdout.strip.empty?)

  pam_ldap_enabled = (!command('grep "^[^#]*pam_ldap\.so" /etc/pam.d/*').stdout.strip.empty?)

  if !(sssd_id_ldap_enabled or pam_ldap_enabled)
    impact 0.0
    describe "LDAP not enabled" do
      skip "LDAP not enabled using any known mechanisms, this control is Not Applicable."
    end
  end

  if sssd_id_ldap_enabled
    ldap_id_use_start_tls = command('grep ldap_id_use_start_tls /etc/sssd/sssd.conf')
    describe ldap_id_use_start_tls do
      its('stdout.strip') { should match %r{^ldap_id_use_start_tls\s*=\s*true$}}
    end

    ldap_id_use_start_tls.stdout.strip.each_line do |line|
      describe line do
        it { should match %r{^ldap_id_use_start_tls\s*=\s*true$}}
      end
    end
  end

  if pam_ldap_enabled
    describe command('grep -i ssl /etc/pam_ldap.conf') do
      its('stdout.strip') { should match %r{^ssl start_tls$}}
    end
  end
end

