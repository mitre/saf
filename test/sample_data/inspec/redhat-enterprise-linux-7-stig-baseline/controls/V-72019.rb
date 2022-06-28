# -*- encoding : utf-8 -*-
control "V-72019" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that all local interactive user home directories are owned by their respective
users."
  desc  "If a local interactive user does not own their home directory,
unauthorized users could access or modify the user's files, and the users may
not be able to access their own files."
  desc  "rationale", ""
  desc  "check", "
    Verify the assigned home directory of all local interactive users on the
system exists.

    Check the home directory assignment for all local interactive users on the
system with the following command:

    # ls -ld $(egrep ':[0-9]{4}' /etc/passwd | cut -d: -f6)

    -rwxr-x--- 1 smithj users 18 Mar 5 17:06 /home/smithj

    If any home directories referenced in \"/etc/passwd\" are not owned by the
interactive user, this is a finding.
  "
  desc  "fix", "
    Change the owner of a local interactive user's home directories to that
owner. To change the owner of a local interactive user's home directory, use
the following command:

    Note: The example will be for the user smithj, who has a home directory of
\"/home/smithj\".

    # chown smithj /home/smithj
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72019"
  tag rid: "SV-86643r5_rule"
  tag stig_id: "RHEL-07-020640"
  tag fix_id: "F-78371r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  exempt_home_users = input('exempt_home_users')
  non_interactive_shells = input('non_interactive_shells')

  ignore_shells = non_interactive_shells.join('|')

  uid_min = login_defs.read_params['UID_MIN'].to_i
  uid_min = 1000 if uid_min.nil?

  findings = Set[]
  users.where{ !shell.match(ignore_shells) && (uid >= uid_min || uid == 0)}.entries.each do |user_info|
    next if exempt_home_users.include?("#{user_info.username}")
    describe directory(user_info.home) do
      it { should exist }
      its('owner') { should eq user_info.username }
    end
  end
end

