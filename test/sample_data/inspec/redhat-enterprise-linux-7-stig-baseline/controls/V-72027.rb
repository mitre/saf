# -*- encoding : utf-8 -*-
control "V-72027" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that all files and directories contained in local interactive user home
directories have a mode of 0750 or less permissive."
  desc  "If a local interactive user files have excessive permissions,
unintended users may be able to access or modify them."
  desc  "rationale", ""
  desc  "check", "
    Verify all files and directories contained in a local interactive user home
directory, excluding local initialization files, have a mode of \"0750\".

    Check the mode of all non-initialization files in a local interactive user
home directory with the following command:

    Files that begin with a \".\" are excluded from this requirement.

    Note: The example will be for the user \"smithj\", who has a home directory
of \"/home/smithj\".

    # ls -lLR /home/smithj
    -rwxr-x--- 1 smithj smithj  18 Mar  5 17:06 file1
    -rwxr----- 1 smithj smithj 193 Mar  5 17:06 file2
    -rw-r-x--- 1 smithj smithj 231 Mar  5 17:06 file3

    If any files are found with a mode more permissive than \"0750\", this is a
finding.
  "
  desc  "fix", "
    Set the mode on files and directories in the local interactive user home
directory with the following command:

    Note: The example will be for the user smithj, who has a home directory of
\"/home/smithj\" and is a member of the users group.

    # chmod 0750 /home/smithj/<file>
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72027"
  tag rid: "SV-86651r2_rule"
  tag stig_id: "RHEL-07-020680"
  tag fix_id: "F-78379r1_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  exempt_home_users = input('exempt_home_users')
  non_interactive_shells = input('non_interactive_shells')

  ignore_shells = non_interactive_shells.join('|')

  findings = Set[]
  users.where{ !shell.match(ignore_shells) && (uid >= 1000 || uid == 0)}.entries.each do |user_info|
    next if exempt_home_users.include?("#{user_info.username}")
    findings = findings + command("find #{user_info.home} -xdev ! -name '.*' -perm /027 ! -type l").stdout.split("\n")
  end
  describe "Home directories with excessive permissions" do
    subject { findings.to_a }
    it { should be_empty }
  end
end

