# -*- encoding : utf-8 -*-
control "V-81003" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that /etc/pam.d/passwd implements /etc/pam.d/system-auth when changing
passwords."
  desc  "Pluggable authentication modules (PAM) allow for a modular approach to
integrating authentication methods. PAM operates in a top-down processing model
and if the modules are not listed in the correct order, an important security
function could be bypassed if stack entries are not centralized."
  desc  "rationale", ""
  desc  "check", "
    Verify that /etc/pam.d/passwd is configured to use /etc/pam.d/system-auth
when changing passwords:

    # cat /etc/pam.d/passwd | grep -i substack | grep -i system-auth
    password     substack     system-auth

    If no results are returned, the line is commented out, this is a finding.
  "
  desc  "fix", "
    Configure PAM to utilize /etc/pam.d/system-auth when changing passwords.

    Add the following line to \"/etc/pam.d/passwd\" (or modify the line to have
the required value):

    password     substack    system-auth
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000069-GPOS-00037"
  tag gid: "V-81003"
  tag rid: "SV-95715r1_rule"
  tag stig_id: "RHEL-07-010118"
  tag fix_id: "F-87837r1_fix"
  tag cci: ["CCI-000192"]
  tag nist: ["IA-5 (1) (a)"]

  # Get the content of /etc/pam.d/passwd as an array
  pam_passwd_content = file('/etc/pam.d/passwd').content.strip.split("\n")
  # Make a new array of any line matching the target pattern:
  # /password\s+substack\s+system-auth
  matching_lines = pam_passwd_content.select { |i| i.match(/password\s+substack\s+system-auth/) }

  describe '/etc/pam.d/passwd' do
    subject { matching_lines }
    it 'substacks system-auth' do
      expect(subject.length).to(eql 1)
    end
  end
end

