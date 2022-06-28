# -*- encoding : utf-8 -*-
control "V-71925" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that passwords for new users are restricted to a 24 hours/1 day minimum
lifetime."
  desc  "Enforcing a minimum password lifetime helps to prevent repeated
password changes to defeat the password reuse or history enforcement
requirement. If users are allowed to immediately and continually change their
password, the password could be repeatedly changed in a short period of time to
defeat the organization's policy regarding password reuse."
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system enforces 24 hours/1 day as the minimum password
lifetime for new user accounts.

    Check for the value of \"PASS_MIN_DAYS\" in \"/etc/login.defs\" with the
following command:

    # grep -i pass_min_days /etc/login.defs
    PASS_MIN_DAYS     1

    If the \"PASS_MIN_DAYS\" parameter value is not \"1\" or greater, or is
commented out, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to enforce 24 hours/1 day as the minimum
password lifetime.

    Add the following line in \"/etc/login.defs\" (or modify the line to have
the required value):

    PASS_MIN_DAYS     1
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000075-GPOS-00043"
  tag gid: "V-71925"
  tag rid: "SV-86549r2_rule"
  tag stig_id: "RHEL-07-010230"
  tag fix_id: "F-78277r1_fix"
  tag cci: ["CCI-000198"]
  tag nist: ["IA-5 (1) (d)"]

  describe login_defs do
    its('PASS_MIN_DAYS.to_i') { should cmp >= 1 }
  end
end

