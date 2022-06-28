# -*- encoding : utf-8 -*-
control "V-72095" do
  title "The Red Hat Enterprise Linux operating system must audit all
executions of privileged functions."
  desc  "Misuse of privileged functions, either intentionally or
unintentionally by authorized users, or by unauthorized external entities that
have compromised information system accounts, is a serious and ongoing concern
and can have significant adverse impacts on organizations. Auditing the use of
privileged functions is one way to detect such misuse and identify the risk
from insider threats and the advanced persistent threat."
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system audits the execution of privileged functions
using the following command:

    # grep -iw execve /etc/audit/audit.rules

    -a always,exit -F arch=b32 -S execve -C uid!=euid -F euid=0 -k setuid
    -a always,exit -F arch=b64 -S execve -C uid!=euid -F euid=0 -k setuid
    -a always,exit -F arch=b32 -S execve -C gid!=egid -F egid=0 -k setgid
    -a always,exit -F arch=b64 -S execve -C gid!=egid -F egid=0 -k setgid


    If both the \"b32\" and \"b64\" audit rules for \"SUID\" files are not
defined, this is a finding.

    If both the \"b32\" and \"b64\" audit rules for \"SGID\" files are not
defined, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to audit the execution of privileged
functions.

    Add or update the following rules in \"/etc/audit/rules.d/audit.rules\":

    -a always,exit -F arch=b32 -S execve -C uid!=euid -F euid=0 -k setuid
    -a always,exit -F arch=b64 -S execve -C uid!=euid -F euid=0 -k setuid
    -a always,exit -F arch=b32 -S execve -C gid!=egid -F egid=0 -k setgid
    -a always,exit -F arch=b64 -S execve -C gid!=egid -F egid=0 -k setgid

    The audit daemon must be restarted for the changes to take effect.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000327-GPOS-00127"
  tag gid: "V-72095"
  tag rid: "SV-86719r7_rule"
  tag stig_id: "RHEL-07-030360"
  tag fix_id: "F-78447r9_fix"
  tag cci: ["CCI-002234"]
  tag nist: ["AC-6 (9)"]

  # All execve calls should use 'always,exit'
  describe auditd.syscall('execve') do
    its('action.uniq') { should eq ['always'] }
    its('list.uniq') { should eq ['exit'] }
  end

  # Work with the SUID rules
  describe auditd.syscall('execve').where { fields.include?('euid=0') } do
    its ('arch.uniq') { should include 'b32' }
    its ('arch.uniq') { should include 'b64' }
  end

  # Work with the SGID rules
  describe auditd.syscall('execve').where { fields.include?('egid=0') } do
    its ('arch.uniq') { should include 'b32' }
    its ('arch.uniq') { should include 'b64' }
  end
end

