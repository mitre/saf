# -*- encoding : utf-8 -*-
control "V-72229" do
  title "The Red Hat Enterprise Linux operating system must implement
cryptography to protect the integrity of Lightweight Directory Access Protocol
(LDAP) communications."
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
integrity of remote LDAP access sessions.

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

    Verify the sssd service is configured to require the use of certificates:

    # grep -i tls_reqcert /etc/sssd/sssd.conf
    ldap_tls_reqcert = demand

    If the \"ldap_tls_reqcert\" setting is missing, commented out, or does not
exist, this is a finding.

    If the \"ldap_tls_reqcert\" setting is not set to \"demand\" or \"hard\",
this is a finding.
  "
  desc  "fix", "
    Configure the operating system to implement cryptography to protect the
integrity of LDAP remote access sessions.

    Add or modify the following line in \"/etc/sssd/sssd.conf\":

    ldap_tls_reqcert = demand
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000250-GPOS-00093"
  tag gid: "V-72229"
  tag rid: "SV-86853r4_rule"
  tag stig_id: "RHEL-07-040190"
  tag fix_id: "F-78583r4_fix"
  tag cci: ["CCI-001453"]
  tag nist: ["AC-17 (2)"]

  sssd_id_ldap_enabled = (package('sssd').installed? and
    !command('grep "^\s*id_provider\s*=\s*ldap" /etc/sssd/sssd.conf').stdout.strip.empty?)

  sssd_ldap_enabled = (package('sssd').installed? and
    !command('grep "^\s*[a-z]*_provider\s*=\s*ldap" /etc/sssd/sssd.conf').stdout.strip.empty?)

  pam_ldap_enabled = (!command('grep "^[^#]*pam_ldap\.so" /etc/pam.d/*').stdout.strip.empty?)

  if !(sssd_id_ldap_enabled or sssd_ldap_enabled or pam_ldap_enabled)
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

  if sssd_ldap_enabled
    ldap_tls_cacertdir = command('grep -i ldap_tls_cacertdir /etc/sssd/sssd.conf').
      stdout.strip.scan(%r{^ldap_tls_cacertdir\s*=\s*(.*)}).last

    describe "ldap_tls_cacertdir" do
      subject { ldap_tls_cacertdir }
      it { should_not eq nil }
    end

    describe file(ldap_tls_cacertdir.last) do
      it { should exist }
      it { should be_directory }
    end if !ldap_tls_cacertdir.nil?
  end

  if pam_ldap_enabled
    tls_cacertdir = command('grep -i tls_cacertdir /etc/pam_ldap.conf').
      stdout.strip.scan(%r{^tls_cacertdir\s+(.*)}).last

    describe "tls_cacertdir" do
      subject { tls_cacertdir }
      it { should_not eq nil }
    end

    describe file(tls_cacertdir.last) do
      it { should exist }
      it { should be_directory }
    end if !tls_cacertdir.nil?
  end
end

