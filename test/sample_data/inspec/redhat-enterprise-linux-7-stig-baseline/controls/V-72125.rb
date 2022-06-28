# -*- encoding : utf-8 -*-
control "V-72125" do
  title "The Red Hat Enterprise Linux operating system must audit all uses of
the open syscall."
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
successful/unsuccessful attempts to use the \"open\" syscall occur.

    Check the file system rules in \"/etc/audit/audit.rules\" with the
following commands:

    # grep -iw open /etc/audit/audit.rules

    -a always,exit -F arch=b32 -S open -F exit=-EPERM -F auid>=1000 -F
auid!=4294967295 -k access

    -a always,exit -F arch=b32 -S open -F exit=-EACCES -F auid>=1000 -F
auid!=4294967295 -k access

    -a always,exit -F arch=b64 -S open -F exit=-EPERM -F auid>=1000 -F
auid!=4294967295 -k access

    -a always,exit -F arch=b64 -S open -F exit=-EACCES -F auid>=1000 -F
auid!=4294967295 -k access

    If both the \"b32\" and \"b64\" audit rules are not defined for the
\"open\" syscall, this is a finding.

    If the output does not produce rules containing \"-F exit=-EPERM\", this is
a finding.

    If the output does not produce rules containing \"-F exit=-EACCES\", this
is a finding.
  "
  desc  "fix", "
    Configure the operating system to generate audit records when
successful/unsuccessful attempts to use the \"open\" syscall occur.

    Add or update the following rules in \"/etc/audit/rules.d/audit.rules\":

    -a always,exit -F arch=b32 -S open -F exit=-EPERM -F auid>=1000 -F
auid!=4294967295 -k access

    -a always,exit -F arch=b32 -S open -F exit=-EACCES -F auid>=1000 -F
auid!=4294967295 -k access

    -a always,exit -F arch=b64 -S open -F exit=-EPERM -F auid>=1000 -F
auid!=4294967295 -k access

    -a always,exit -F arch=b64 -S open -F exit=-EACCES -F auid>=1000 -F
auid!=4294967295 -k access

    The audit daemon must be restarted for the changes to take effect.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000064-GPOS-00033"
  tag satisfies: ["SRG-OS-000064-GPOS-00033", "SRG-OS-000458-GPOS-00203",
"SRG-OS-000461-GPOS-00205", "SRG-OS-000392-GPOS-00172"]
  tag gid: "V-72125"
  tag rid: "SV-86749r5_rule"
  tag stig_id: "RHEL-07-030510"
  tag fix_id: "F-78477r7_fix"
  tag cci: ["CCI-000172", "CCI-002884"]
  tag nist: ["AU-12 c", "MA-4 (1) (a)"]

  describe auditd.syscall("open").where {arch == "b32"} do
    its('action.uniq') { should eq ['always'] }
    its('list.uniq') { should eq ['exit'] }
    its('exit.uniq') { should include '-EPERM' }
  end
  describe auditd.syscall("open").where {arch == "b32"} do
    its('action.uniq') { should eq ['always'] }
    its('list.uniq') { should eq ['exit'] }
    its('exit.uniq') { should include '-EACCES' }
  end

  if os.arch == 'x86_64'
    describe auditd.syscall("open").where {arch == "b64"} do
      its('action.uniq') { should eq ['always'] }
      its('list.uniq') { should eq ['exit'] }
      its('exit.uniq') { should include '-EPERM' }
    end
    describe auditd.syscall("open").where {arch == "b64"} do
      its('action.uniq') { should eq ['always'] }
      its('list.uniq') { should eq ['exit'] }
      its('exit.uniq') { should include '-EACCES' }
    end
  end
end

