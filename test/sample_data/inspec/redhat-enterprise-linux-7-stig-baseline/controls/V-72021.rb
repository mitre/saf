# -*- encoding : utf-8 -*-
control "V-72021" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that all local interactive user home directories are group-owned by the home
directory owners primary group."
  desc  "If the Group Identifier (GID) of a local interactive user's home
directory is not the same as the primary GID of the user, this would allow
unauthorized access to the user's files, and users that share the same group
may not be able to access files that they legitimately should."
  desc  "rationale", ""
  desc  "check", "
    Verify the assigned home directory of all local interactive users is
group-owned by that user's primary GID.

    Check the home directory assignment for all local interactive users on the
system with the following command:

    # ls -ld $(egrep ':[0-9]{4}' /etc/passwd | cut -d: -f6)

    -rwxr-x--- 1 smithj users 18 Mar 5 17:06 /home/smithj

    Check the user's primary group with the following command:

    # grep users /etc/group

    users:x:250:smithj,jonesj,jacksons

    If the user home directory referenced in \"/etc/passwd\" is not group-owned
by that user's primary GID, this is a finding.
  "
  desc  "fix", "
    Change the group owner of a local interactive user's home directory to the
group found in \"/etc/passwd\". To change the group owner of a local
interactive user's home directory, use the following command:

    Note: The example will be for the user \"smithj\", who has a home directory
of \"/home/smithj\", and has a primary group of users.

    # chgrp users /home/smithj
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72021"
  tag rid: "SV-86645r5_rule"
  tag stig_id: "RHEL-07-020650"
  tag fix_id: "F-78373r2_fix"
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
    findings = findings + command("find #{user_info.home} -maxdepth 0 -not -gid #{user_info.gid}").stdout.split("\n")
  end
  describe "Home directories that are not group-owned by the user's primary GID" do
    subject { findings.to_a }
    it { should be_empty }
  end
end

