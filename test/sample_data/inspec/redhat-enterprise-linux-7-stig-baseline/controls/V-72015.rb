# -*- encoding : utf-8 -*-
control "V-72015" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that all local interactive user home directories are defined in the /etc/passwd
file."
  desc  "If a local interactive user has a home directory defined that does not
exist, the user may be given access to the / directory as the current working
directory upon logon. This could create a Denial of Service because the user
would not be able to access their logon configuration files, and it may give
them visibility to system files they normally would not be able to access."
  desc  "rationale", ""
  desc  "check", "
    Verify the assigned home directory of all local interactive users on the
system exists.

    Check the home directory assignment for all local interactive
non-privileged users on the system with the following command:

    # cut -d: -f 1,3,6 /etc/passwd | egrep \":[1-4][0-9]{3}\"

    smithj:1001:/home/smithj

    Note: This may miss interactive users that have been assigned a privileged
UID. Evidence of interactive use may be obtained from a number of log files
containing system logon information.

    Check that all referenced home directories exist with the following command:

    # pwck -r
    user 'smithj': directory '/home/smithj' does not exist

    If any home directories referenced in \"/etc/passwd\" are returned as not
defined, this is a finding.
  "
  desc  "fix", "
    Create home directories to all local interactive users that currently do
not have a home directory assigned. Use the following commands to create the
user home directory assigned in \"/etc/ passwd\":

    Note: The example will be for the user smithj, who has a home directory of
\"/home/smithj\", a UID of \"smithj\", and a Group Identifier (GID) of
\"users\" assigned in \"/etc/passwd\".

    # mkdir /home/smithj
    # chown smithj /home/smithj
    # chgrp users /home/smithj
    # chmod 0750 /home/smithj
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72015"
  tag rid: "SV-86639r2_rule"
  tag stig_id: "RHEL-07-020620"
  tag fix_id: "F-78367r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  exempt_home_users = input('exempt_home_users')
  non_interactive_shells = input('non_interactive_shells')

  ignore_shells = non_interactive_shells.join('|')

  uid_min = login_defs.read_params['UID_MIN'].to_i
  uid_min = 1000 if uid_min.nil?

  users.where{ !shell.match(ignore_shells) && (uid >= uid_min || uid == 0)}.entries.each do |user_info|
    next if exempt_home_users.include?("#{user_info.username}")
    describe directory(user_info.home) do
      it { should exist }
    end
  end
end

