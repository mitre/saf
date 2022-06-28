# -*- encoding : utf-8 -*-
control "V-71923" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that user and group account administration utilities are configured to store
only encrypted representations of passwords."
  desc  "Passwords need to be protected at all times, and encryption is the
standard method for protecting passwords. If passwords are not encrypted, they
can be plainly read (i.e., clear text) and easily compromised. Passwords
encrypted with a weak algorithm are no more protected than if they are kept in
plain text."
  desc  "rationale", ""
  desc  "check", "
    Verify the user and group account administration utilities are configured
to store only encrypted representations of passwords. The strength of
encryption that must be used to hash passwords for all accounts is \"SHA512\".

    Check that the system is configured to create \"SHA512\" hashed passwords
with the following command:

    # grep -i sha512 /etc/libuser.conf

    crypt_style = sha512

    If the \"crypt_style\" variable is not set to \"sha512\", is not in the
defaults section, is commented out, or does not exist, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to store only SHA512 encrypted
representations of passwords.

    Add or update the following line in \"/etc/libuser.conf\" in the [defaults]
section:

    crypt_style = sha512
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000073-GPOS-00041"
  tag gid: "V-71923"
  tag rid: "SV-86547r3_rule"
  tag stig_id: "RHEL-07-010220"
  tag fix_id: "F-78275r1_fix"
  tag cci: ["CCI-000196"]
  tag nist: ["IA-5 (1) (c)"]

  describe command("cat /etc/libuser.conf | grep -i sha512") do
    its('stdout.strip') { should match %r(^crypt_style = sha512$) }
  end
end

