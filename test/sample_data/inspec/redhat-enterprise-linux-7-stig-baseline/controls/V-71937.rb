# -*- encoding : utf-8 -*-
control "V-71937" do
  title "The Red Hat Enterprise Linux operating system must not have accounts
configured with blank or null passwords."
  desc  "If an account has an empty password, anyone could log on and run
commands with the privileges of that account. Accounts with empty passwords
should never be used in operational environments."
  desc  "rationale", ""
  desc  "check", "
    To verify that null passwords cannot be used, run the following command:

    # grep nullok /etc/pam.d/system-auth /etc/pam.d/password-auth

    If this produces any output, it may be possible to log on with accounts
with empty passwords.

    If null passwords can be used, this is a finding.
  "
  desc  "fix", "
    If an account is configured for password authentication but does not have
an assigned password, it may be possible to log on to the account without
authenticating.

    Remove any instances of the \"nullok\" option in \"/etc/pam.d/system-auth\"
and \"/etc/pam.d/password-auth\" to prevent logons with empty passwords.

    Note: Manual changes to the listed files may be overwritten by the
\"authconfig\" program. The \"authconfig\" program should not be used to update
the configurations listed in this requirement.
  "
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-71937"
  tag rid: "SV-86561r3_rule"
  tag stig_id: "RHEL-07-010290"
  tag fix_id: "F-78289r3_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  # Fetch all files under /etc/pam.d excluding '*-ac' files
  # but including symlinks
  pam_file_list = command('find /etc/pam.d ! -name \'*-ac\' -a \( -type f -o -type l \)').stdout.strip.split

  pam_file_list.each do |pam_file|
    describe pam(pam_file) do
      its('lines') { should match_pam_rule('.* .* pam_unix.so').all_without_args('nullok') }
    end
  end
end

