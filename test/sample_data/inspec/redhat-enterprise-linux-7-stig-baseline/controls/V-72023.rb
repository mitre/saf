# -*- encoding : utf-8 -*-
control "V-72023" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that all files and directories contained in local interactive user home
directories are owned by the owner of the home directory."
  desc  "If local interactive users do not own the files in their directories,
unauthorized users may be able to access them. Additionally, if files are not
owned by the user, this could be an indication of system compromise."
  desc  "rationale", ""
  desc  "check", "
    Verify all files and directories in a local interactive user's home
directory are owned by the user.

    Check the owner of all files and directories in a local interactive user's
home directory with the following command:

    Note: The example will be for the user \"smithj\", who has a home directory
of \"/home/smithj\".

    # ls -lLR /home/smithj
    -rw-r--r-- 1 smithj smithj  18 Mar  5 17:06 file1
    -rw-r--r-- 1 smithj smithj 193 Mar  5 17:06 file2
    -rw-r--r-- 1 smithj smithj 231 Mar  5 17:06 file3

    If any files are found with an owner different than the home directory
user, this is a finding.
  "
  desc  "fix", "
    Change the owner of a local interactive user's files and directories to
that owner. To change the owner of a local interactive user's files and
directories, use the following command:

    Note: The example will be for the user smithj, who has a home directory of
\"/home/smithj\".

    # chown smithj /home/smithj/<file or directory>
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72023"
  tag rid: "SV-86647r2_rule"
  tag stig_id: "RHEL-07-020660"
  tag fix_id: "F-78375r2_fix"
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
    findings = findings + command("find #{user_info.home} -xdev -xautofs -not -user #{user_info.username}").stdout.split("\n")
  end
  describe "Files and directories that are not owned by the user" do
    subject { findings.to_a }
    it { should be_empty }
  end
end

