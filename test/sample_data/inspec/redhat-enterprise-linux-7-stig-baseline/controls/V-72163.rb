# -*- encoding : utf-8 -*-
control "V-72163" do
  title "The Red Hat Enterprise Linux operating system must audit all uses of
the sudoers file and all files in the /etc/sudoers.d/ directory."
  desc  "Reconstruction of harmful events or forensic analysis is not possible
if audit records do not contain enough information.

    At a minimum, the organization must audit the full-text recording of
privileged access commands. The organization must maintain audit trails in
sufficient detail to reconstruct events to determine the cause and impact of
compromise.


  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system generates audit records when
successful/unsuccessful attempts to access the \"/etc/sudoers\" file and files
in the \"/etc/sudoers.d/\" directory.

    Check for modification of the following files being audited by performing
the following commands to check the file system rules in
\"/etc/audit/audit.rules\":

    # grep -i \"/etc/sudoers\" /etc/audit/audit.rules

    -w /etc/sudoers -p wa -k privileged-actions

    # grep -i \"/etc/sudoers.d/\" /etc/audit/audit.rules

    -w /etc/sudoers.d/ -p wa -k privileged-actions

    If the commands do not return output that match the examples, this is a
finding.
  "
  desc  "fix", "
    Configure the operating system to generate audit records when
successful/unsuccessful attempts to access the \"/etc/sudoers\" file and files
in the \"/etc/sudoers.d/\" directory.

    Add or update the following rule in \"/etc/audit/rules.d/audit.rules\":

    -w /etc/sudoers -p wa -k privileged-actions

    -w /etc/sudoers.d/ -p wa -k privileged-actions

    The audit daemon must be restarted for the changes to take effect.
  "
  tag severity: nil
  tag gtitle: "SRG-OS-000037-GPOS-00015"
  tag satisfies: ["SRG-OS-000037-GPOS-00015", "SRG-OS-000042-GPOS-00020",
"SRG-OS-000392-GPOS-00172", "SRG-OS-000462-GPOS-00206",
"SRG-OS-000471-GPOS-00215"]
  tag gid: "V-72163"
  tag rid: "SV-86787r5_rule"
  tag stig_id: "RHEL-07-030700"
  tag fix_id: "F-78517r6_fix"
  tag cci: ["CCI-000130", "CCI-000135", "CCI-000172", "CCI-002884"]
  tag nist: ["AU-3", "AU-3 (1)", "AU-12 c", "MA-4 (1) (a)"]

  audit_files = ['/etc/sudoers', '/etc/sudoers.d']

  if audit_files.any? { |audit_file| file(audit_file).exist? }
    impact 0.5
  else
    impact 0.0
  end

  audit_files.each do |audit_file|
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
  end

  describe "The #{audit_files} files do not exist" do
    skip "The #{audit_files} files do not exist, this requirement is Not Applicable."
  end if !audit_files.any? { |audit_file| file(audit_file).exist? }
end

