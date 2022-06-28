# -*- encoding : utf-8 -*-
control "V-72005" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that the root account must be the only account having unrestricted access to
the system."
  desc  "If an account other than root also has a User Identifier (UID) of
\"0\", it has root authority, giving that account unrestricted access to the
entire operating system. Multiple accounts with a UID of \"0\" afford an
opportunity for potential intruders to guess a password for a privileged
account."
  desc  "rationale", ""
  desc  "check", "
    Check the system for duplicate UID \"0\" assignments with the following
command:

    # awk -F: '$3 == 0 {print $1}' /etc/passwd

    If any accounts other than root have a UID of \"0\", this is a finding.
  "
  desc  "fix", "
    Change the UID of any account on the system, other than root, that has a
UID of \"0\".

    If the account is associated with system commands or applications, the UID
should be changed to one greater than \"0\" but less than \"1000\". Otherwise,
assign a UID of greater than \"1000\" that has not already been assigned.
  "
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72005"
  tag rid: "SV-86629r2_rule"
  tag stig_id: "RHEL-07-020310"
  tag fix_id: "F-78357r1_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  describe passwd.uids(0) do
    its('users') { should cmp 'root' }
    its('entries.length') { should eq 1 }
  end
end

