# -*- encoding : utf-8 -*-
control "V-72011" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that all local interactive users have a home directory assigned in the
/etc/passwd file."
  desc  "If local interactive users are not assigned a valid home directory,
there is no place for the storage and control of files they should own."
  desc  "rationale", ""
  desc  "check", "
    Verify local interactive users on the system have a home directory assigned.

    Check for missing local interactive user home directories with the
following command:

    # pwck -r
    user 'lp': directory '/var/spool/lpd' does not exist
    user 'news': directory '/var/spool/news' does not exist
    user 'uucp': directory '/var/spool/uucp' does not exist
    user 'smithj': directory '/home/smithj' does not exist

    Ask the System Administrator (SA) if any users found without home
directories are local interactive users. If the SA is unable to provide a
response, check for users with a User Identifier (UID) of 1000 or greater with
the following command:

    # cut -d: -f 1,3 /etc/passwd | egrep \":[1-4][0-9]{2}$|:[0-9]{1,2}$\"

    If any interactive users do not have a home directory assigned, this is a
finding.
  "
  desc  "fix", "Assign home directories to all local interactive users that
currently do not have a home directory assigned."
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72011"
  tag rid: "SV-86635r2_rule"
  tag stig_id: "RHEL-07-020600"
  tag fix_id: "F-78363r1_fix"
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

