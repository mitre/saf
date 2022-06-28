# -*- encoding : utf-8 -*-
control "V-71927" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that passwords are restricted to a 24 hours/1 day minimum lifetime."
  desc  "Enforcing a minimum password lifetime helps to prevent repeated
password changes to defeat the password reuse or history enforcement
requirement. If users are allowed to immediately and continually change their
password, the password could be repeatedly changed in a short period of time to
defeat the organization's policy regarding password reuse."
  desc  "rationale", ""
  desc  "check", "
    Check whether the minimum time period between password changes for each
user account is one day or greater.

    # awk -F: '$4 < 1 {print $1 \" \" $4}' /etc/shadow

    If any results are returned that are not associated with a system account,
this is a finding.
  "
  desc  "fix", "
    Configure non-compliant accounts to enforce a 24 hours/1 day minimum
password lifetime:

    # chage -m 1 [user]
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000075-GPOS-00043"
  tag gid: "V-71927"
  tag rid: "SV-86551r2_rule"
  tag stig_id: "RHEL-07-010240"
  tag fix_id: "F-78279r1_fix"
  tag cci: ["CCI-000198"]
  tag nist: ["IA-5 (1) (d)"]

  shadow.users.each do |user|
    # filtering on non-system accounts (uid >= 1000)
    next unless user(user).uid >= 1000
    describe shadow.users(user) do
      its('min_days.first.to_i') { should cmp >= 1 }
    end
  end
end

