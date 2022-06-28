# -*- encoding : utf-8 -*-
control "V-72031" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that all local initialization files for local interactive users are be
group-owned by the users primary group or root."
  desc  "Local initialization files for interactive users are used to configure
the user's shell environment upon logon. Malicious modification of these files
could compromise accounts upon logon."
  desc  "rationale", ""
  desc  "check", "
    Verify the local initialization files of all local interactive users are
group-owned by that user's primary Group Identifier (GID).

    Check the home directory assignment for all non-privileged users on the
system with the following command:

    Note: The example will be for the smithj user, who has a home directory of
\"/home/smithj\" and a primary group of \"users\".

    # cut -d: -f 1,4,6 /etc/passwd | egrep \":[1-4][0-9]{3}\"
    smithj:1000:/home/smithj

    # grep 1000 /etc/group
    users:x:1000:smithj,jonesj,jacksons

    Note: This may miss interactive users that have been assigned a privileged
User Identifier (UID). Evidence of interactive use may be obtained from a
number of log files containing system logon information.

    Check the group owner of all local interactive user's initialization files
with the following command:

    # ls -al /home/smithj/.[^.]* | more

    -rwxr-xr-x 1 smithj users 896 Mar 10 2011 .profile
    -rwxr-xr-x 1 smithj users 497 Jan 6 2007 .login
    -rwxr-xr-x 1 smithj users 886 Jan 6 2007 .something

    If all local interactive user's initialization files are not group-owned by
that user's primary GID, this is a finding.
  "
  desc  "fix", "
    Change the group owner of a local interactive user's files to the group
found in \"/etc/passwd\" for the user. To change the group owner of a local
interactive user's home directory, use the following command:

    Note: The example will be for the user smithj, who has a home directory of
\"/home/smithj\", and has a primary group of users.

    # chgrp users /home/smithj/.[^.]*
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72031"
  tag rid: "SV-86655r4_rule"
  tag stig_id: "RHEL-07-020700"
  tag fix_id: "F-78383r4_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  exempt_home_users = input('exempt_home_users')
  non_interactive_shells = input('non_interactive_shells')

  ignore_shells = non_interactive_shells.join('|')

  findings = Set[]
  users.where{ !shell.match(ignore_shells) && (uid >= 1000 || uid == 0)}.entries.each do |user_info|
    findings = findings + command("find #{user_info.home} -name '.*' -not -gid #{user_info.gid} -not -group root").stdout.split("\n")
  end
  describe findings do
    its('length') { should == 0 }
  end
end

