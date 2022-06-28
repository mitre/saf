# -*- encoding : utf-8 -*-
control "V-81015" do
  title "The Red Hat Enterprise Linux operating system must be configured to
use the au-remote plugin."
  desc  "Information stored in one location is vulnerable to accidental or
incidental deletion or alteration.

    Off-loading is a common process in information systems with limited audit
storage capacity.

    Without the configuration of the \"au-remote\" plugin, the audisp-remote
daemon will not off-load the logs from the system being audited.


  "
  desc  "rationale", ""
  desc  "check", "
    Verify the \"au-remote\" plugin is active on the system:

    # grep \"active\" /etc/audisp/plugins.d/au-remote.conf

    active = yes

    If the \"active\" setting is not set to \"yes\", or the line is commented
out, this is a finding.
  "
  desc  "fix", "
    Edit the /etc/audisp/plugins.d/au-remote.conf file and change the value of
\"active\" to \"yes\".

    The audit daemon must be restarted for changes to take effect:

    # service auditd restart
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000342-GPOS-00133"
  tag satisfies: ["SRG-OS-000342-GPOS-00133", "SRG-OS-000479-GPOS-00224"]
  tag gid: "V-81015"
  tag rid: "SV-95727r1_rule"
  tag stig_id: "RHEL-07-030200"
  tag fix_id: "F-87849r2_fix"
  tag cci: ["CCI-001851"]
  tag nist: ["AU-4 (1)"]

  test_file = '/etc/audisp/plugins.d/au-remote.conf'

  if file(test_file).exist?
    describe parse_config_file(test_file) do
      its('active') { should match %r{yes$} }
    end
  else
    describe "File '#{test_file}' cannot be found. This test cannot be checked in a automated fashion and you must check it manually" do
      skip "File '#{test_file}' cannot be found. This check must be performed manually"
    end
  end
end

