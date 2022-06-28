# -*- encoding : utf-8 -*-
control "V-72173" do
  title "The Red Hat Enterprise Linux operating system must audit all uses of
the umount command."
  desc  "Reconstruction of harmful events or forensic analysis is not possible
if audit records do not contain enough information.

    At a minimum, the organization must audit the full-text recording of
privileged mount commands. The organization must maintain audit trails in
sufficient detail to reconstruct events to determine the cause and impact of
compromise.


  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system generates audit records when
successful/unsuccessful attempts to use the \"umount\" command occur.

    Check that the following system call is being audited by performing the
following series of commands to check the file system rules in
\"/etc/audit/audit.rules\":

    # grep -iw \"/usr/bin/umount\" /etc/audit/audit.rules

    -a always,exit -F path=/usr/bin/umount -F auid>=1000 -F auid!=4294967295 -k
privileged-mount

    If the command does not return any output, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to generate audit records when
successful/unsuccessful attempts to use the \"umount\" command occur.

    Add or update the following rule in \"/etc/audit/rules.d/audit.rules\":

    -a always,exit -F path=/usr/bin/umount -F auid>=1000 -F auid!=4294967295 -k
privileged-mount

    The audit daemon must be restarted for the changes to take effect.
  "
  tag severity: nil
  tag gtitle: "SRG-OS-000042-GPOS-00020"
  tag satisfies: ["SRG-OS-000042-GPOS-00020", "SRG-OS-000392-GPOS-00172"]
  tag gid: "V-72173"
  tag rid: "SV-86797r5_rule"
  tag stig_id: "RHEL-07-030750"
  tag fix_id: "F-78527r5_fix"
  tag cci: ["CCI-000135", "CCI-002884"]
  tag nist: ["AU-3 (1)", "MA-4 (1) (a)"]

  audit_file = '/bin/umount'

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
