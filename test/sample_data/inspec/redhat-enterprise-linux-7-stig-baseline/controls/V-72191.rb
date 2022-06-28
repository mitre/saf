# -*- encoding : utf-8 -*-
control "V-72191" do
  title "The Red Hat Enterprise Linux operating system must audit all uses of
the kmod command."
  desc  "Without generating audit records that are specific to the security and
mission needs of the organization, it would be difficult to establish,
correlate, and investigate the events relating to an incident or identify those
responsible for one.

    Audit records can be generated from various components within the
information system (e.g., module or policy filter).


  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system generates audit records when
successful/unsuccessful attempts to use the \"kmod\" command occur.

    Check the auditing rules in \"/etc/audit/audit.rules\" with the following
command:

    # grep -iw kmod /etc/audit/audit.rules

    -w /usr/bin/kmod -p x -F auid!=4294967295 -k module-change

    If the command does not return any output, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to generate audit records when
successful/unsuccessful attempts to use the \"kmod\" command occur.

    Add or update the following rule in \"/etc/audit/rules.d/audit.rules\":

    -w /usr/bin/kmod -p x -F auid!=4294967295 -k module-change

    The audit daemon must be restarted for the changes to take effect.
  "
  tag severity: nil
  tag gtitle: "SRG-OS-000471-GPOS-00216"
  tag satisfies: ["SRG-OS-000471-GPOS-00216", "SRG-OS-000477-GPOS-00222"]
  tag gid: "V-72191"
  tag rid: "SV-86815r5_rule"
  tag stig_id: "RHEL-07-030840"
  tag fix_id: "F-78545r10_fix"
  tag cci: ["CCI-000172"]
  tag nist: ["AU-12 c"]

  audit_file = '/usr/bin/kmod'

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
