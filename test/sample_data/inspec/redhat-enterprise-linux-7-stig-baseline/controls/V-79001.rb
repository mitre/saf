# -*- encoding : utf-8 -*-
control "V-79001" do
  title "The Red Hat Enterprise Linux operating system must audit all uses of
the finit_module syscall."
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
successful/unsuccessful attempts to use the \"finit_module\" syscall occur.

    Check the auditing rules in \"/etc/audit/audit.rules\" with the following
command:

    # grep -iw finit_module /etc/audit/audit.rules

    -a always,exit -F arch=b32 -S finit_module -k module-change

    -a always,exit -F arch=b64 -S finit_module -k module-change

    If both the \"b32\" and \"b64\" audit rules are not defined for the
\"finit_module\" syscall, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to generate audit records when
successful/unsuccessful attempts to use the \"finit_module\" syscall occur.

    Add or update the following rules in \"/etc/audit/rules.d/audit.rules\":

    -a always,exit -F arch=b32 -S finit_module -k module-change

    -a always,exit -F arch=b64 -S finit_module -k module-change

    The audit daemon must be restarted for the changes to take effect.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000471-GPOS-00216"
  tag satisfies: ["SRG-OS-000471-GPOS-00216", "SRG-OS-000477-GPOS-00222"]
  tag gid: "V-79001"
  tag rid: "SV-93707r3_rule"
  tag stig_id: "RHEL-07-030821"
  tag fix_id: "F-85751r3_fix"
  tag cci: ["CCI-000172"]
  tag nist: ["AU-12 c"]

  describe auditd.syscall("finit_module").where {arch == "b32"} do
    its('action.uniq') { should eq ['always'] }
    its('list.uniq') { should eq ['exit'] }
  end
  if os.arch == 'x86_64'
    describe auditd.syscall("finit_module").where {arch == "b64"} do
      its('action.uniq') { should eq ['always'] }
      its('list.uniq') { should eq ['exit'] }
    end
  end
end

