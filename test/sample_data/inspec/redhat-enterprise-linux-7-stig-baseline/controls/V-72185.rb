# -*- encoding : utf-8 -*-
control "V-72185" do
  title "The Red Hat Enterprise Linux operating system must audit all uses of
the pam_timestamp_check command."
  desc  "Without generating audit records that are specific to the security and
mission needs of the organization, it would be difficult to establish,
correlate, and investigate the events relating to an incident or identify those
responsible for one."
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system generates audit records when
successful/unsuccessful attempts to use the \"pam_timestamp_check\" command
occur.

    Check the auditing rules in \"/etc/audit/audit.rules\" with the following
command:

    # grep -iw \"/usr/sbin/pam_timestamp_check\" /etc/audit/audit.rules

    -a always,exit -F path=/usr/sbin/pam_timestamp_check -F auid>=1000 -F
auid!=4294967295 -k privileged-pam

    If the command does not return any output, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to generate audit records when
successful/unsuccessful attempts to use the \"pam_timestamp_check\" command
occur.

    Add or update the following rule in \"/etc/audit/rules.d/audit.rules\":

    -a always,exit -F path=/usr/sbin/pam_timestamp_check -F auid>=1000 -F
auid!=4294967295 -k privileged-pam

    The audit daemon must be restarted for the changes to take effect.
  "
  tag severity: nil
  tag gtitle: "SRG-OS-000471-GPOS-00215"
  tag gid: "V-72185"
  tag rid: "SV-86809r4_rule"
  tag stig_id: "RHEL-07-030810"
  tag fix_id: "F-78539r4_fix"
  tag cci: ["CCI-000172"]
  tag nist: ["AU-12 c"]

  audit_file = '/sbin/pam_timestamp_check'

  if file(audit_file).exist?
    impact 0.5
  else
    impact 0.0
  end

  describe auditd.file(audit_file) do
    its('permissions') { should include ['x'] }
    its('action') { should_not include 'never' }
  end if file(audit_file).exist?

  describe "The #{audit_file} file does not exist" do
    skip "The #{audit_file} file does not exist, this requirement is Not Applicable."
  end if !file(audit_file).exist?
end
