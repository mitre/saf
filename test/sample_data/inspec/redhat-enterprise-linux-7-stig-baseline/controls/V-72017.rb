# -*- encoding : utf-8 -*-
control "V-72017" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that all local interactive user home directories have mode 0750 or less
permissive."
  desc  "Excessive permissions on local interactive user home directories may
allow unauthorized access to user files by other users."
  desc  "rationale", ""
  desc  "check", "
    Verify the assigned home directory of all local interactive users has a
mode of \"0750\" or less permissive.

    Check the home directory assignment for all non-privileged users on the
system with the following command:

    Note: This may miss interactive users that have been assigned a privileged
User Identifier (UID). Evidence of interactive use may be obtained from a
number of log files containing system logon information.

    # ls -ld $(egrep ':[0-9]{4}' /etc/passwd | cut -d: -f6)
    -rwxr-x--- 1 smithj users  18 Mar  5 17:06 /home/smithj

    If home directories referenced in \"/etc/passwd\" do not have a mode of
\"0750\" or less permissive, this is a finding.
  "
  desc  "fix", "
    Change the mode of interactive user's home directories to \"0750\". To
change the mode of a local interactive user's home directory, use the following
command:

    Note: The example will be for the user \"smithj\".

    # chmod 0750 /home/smithj
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72017"
  tag rid: "SV-86641r3_rule"
  tag stig_id: "RHEL-07-020630"
  tag fix_id: "F-78369r2_fix"
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
    findings = findings + command("find #{user_info.home} -maxdepth 0 -perm /027").stdout.split("\n")
  end
  describe "Home directories with excessive permissions" do
    subject { findings.to_a }
    it { should be_empty }
  end
end

