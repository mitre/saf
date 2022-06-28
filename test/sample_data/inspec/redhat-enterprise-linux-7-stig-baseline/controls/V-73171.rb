# -*- encoding : utf-8 -*-
control "V-73171" do
  title "The Red Hat Enterprise Linux operating system must generate audit
records for all account creations, modifications, disabling, and termination
events that affect /etc/shadow."
  desc  "Without generating audit records that are specific to the security and
mission needs of the organization, it would be difficult to establish,
correlate, and investigate the events relating to an incident or identify those
responsible for one.

    Audit records can be generated from various components within the
information system (e.g., module or policy filter).
  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system must generate audit records for all account
creations, modifications, disabling, and termination events that affect
/etc/shadow.

    Check the auditing rules in \"/etc/audit/audit.rules\" with the following
command:

    # grep /etc/shadow /etc/audit/audit.rules

    -w /etc/shadow -p wa -k identity

    If the command does not return a line, or the line is commented out, this
is a finding.
  "
  desc  "fix", "
    Configure the operating system to generate audit records for all account
creations, modifications, disabling, and termination events that affect
/etc/shadow.

    Add or update the following file system rule in
\"/etc/audit/rules.d/audit.rules\":

    -w /etc/shadow -p wa -k identity

    The audit daemon must be restarted for the changes to take effect.
  "
  tag severity: nil
  tag gtitle: "SRG-OS-000004-GPOS-00004"
  tag gid: "V-73171"
  tag rid: "SV-87823r4_rule"
  tag stig_id: "RHEL-07-030873"
  tag fix_id: "F-79617r4_fix"
  tag cci: ["CCI-000018", "CCI-000172", "CCI-001403", "CCI-002130"]
  tag nist: ["AC-2 (4)", "AU-12 c", "AC-2 (4)", "AC-2 (4)"]

  audit_file = '/etc/shadow'

  if file(audit_file).exist?
    impact 0.5
  else
    impact 0.0
  end

  describe auditd.file(audit_file) do
    its('permissions') { should_not cmp [] }
    its('action') { should_not include 'never' }
  end if file(audit_file).exist?

  # Resource creates data structure including all usages of file
  perms = auditd.file(audit_file).permissions

  perms.each do |perm|
    describe perm do
      it { should include 'w' }
      it { should include 'a' }
    end
  end if file(audit_file).exist?

  describe "The #{audit_file} file does not exist" do
    skip "The #{audit_file} file does not exist, this requirement is Not Applicable."
  end if !file(audit_file).exist?

end

