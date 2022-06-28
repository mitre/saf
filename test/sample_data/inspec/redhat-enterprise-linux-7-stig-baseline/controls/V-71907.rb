# -*- encoding : utf-8 -*-
control "V-71907" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that when passwords are changed or new passwords are assigned, the new password
must contain at least one numeric character."
  desc  "Use of a complex password helps to increase the time and resources
required to compromise the password. Password complexity, or strength, is a
measure of the effectiveness of a password in resisting attempts at guessing
and brute-force attacks.

    Password complexity is one factor of several that determines how long it
takes to crack a password. The more complex the password, the greater the
number of possible combinations that need to be tested before the password is
compromised.
  "
  desc  "rationale", ""
  desc  "check", "
    Note: The value to require a number of numeric characters to be set is
expressed as a negative number in \"/etc/security/pwquality.conf\".

    Check the value for \"dcredit\" in \"/etc/security/pwquality.conf\" with
the following command:

    # grep dcredit /etc/security/pwquality.conf
    dcredit = -1

    If the value of \"dcredit\" is not set to a negative value, this is a
finding.
  "
  desc  "fix", "
    Configure the operating system to enforce password complexity by requiring
that at least one numeric character be used by setting the \"dcredit\" option.

    Add the following line to /etc/security/pwquality.conf (or modify the line
to have the required value):

    dcredit = -1
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000071-GPOS-00039"
  tag gid: "V-71907"
  tag rid: "SV-86531r3_rule"
  tag stig_id: "RHEL-07-010140"
  tag fix_id: "F-78259r1_fix"
  tag cci: ["CCI-000194"]
  tag nist: ["IA-5 (1) (a)"]

  describe parse_config_file("/etc/security/pwquality.conf") do
    its('dcredit.to_i') { should cmp < 0 }
  end
end

