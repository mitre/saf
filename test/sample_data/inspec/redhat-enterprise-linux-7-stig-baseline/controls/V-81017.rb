# -*- encoding : utf-8 -*-
control "V-81017" do
  title "The Red Hat Enterprise Linux operating system must configure the
au-remote plugin to off-load audit logs using the audisp-remote daemon."
  desc  "Information stored in one location is vulnerable to accidental or
incidental deletion or alteration.

    Off-loading is a common process in information systems with limited audit
storage capacity.

    Without the configuration of the \"au-remote\" plugin, the audisp-remote
daemon will not off load the logs from the system being audited.


  "
  desc  "rationale", ""
  desc  "check", "
    Verify the \"au-remote\" plugin is configured to always off-load audit logs
using the audisp-remote daemon:

    # cat /etc/audisp/plugins.d/au-remote.conf | grep -v \"^#\"

    active = yes
    direction = out
    path = /sbin/audisp-remote
    type = always
    format = string

    If the \"direction\" setting is not set to \"out\", or the line is
commented out, this is a finding.

    If the \"path\" setting is not set to \"/sbin/audisp-remote\", or the line
is commented out, this is a finding.

    If the \"type\" setting is not set to \"always\", or the line is commented
out, this is a finding.
  "
  desc  "fix", "
    Edit the /etc/audisp/plugins.d/au-remote.conf file and add or update the
following values:

    direction = out
    path = /sbin/audisp-remote
    type = always

    The audit daemon must be restarted for changes to take effect:

    # service auditd restart
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000342-GPOS-00133"
  tag satisfies: ["SRG-OS-000342-GPOS-00133", "SRG-OS-000479-GPOS-00224"]
  tag gid: "V-81017"
  tag rid: "SV-95729r1_rule"
  tag stig_id: "RHEL-07-030201"
  tag fix_id: "F-87851r2_fix"
  tag cci: ["CCI-001851"]
  tag nist: ["AU-4 (1)"]

  test_file = '/etc/audisp/plugins.d/au-remote.conf'

  if file(test_file).exist?
    describe parse_config_file(test_file) do
      its('direction') { should match %r{out$} }
      its('path') { should match %r{/sbin/audisp-remote$} }
      its('type') { should match %r{always$} }
    end
  else
    describe "File '#{test_file}' cannot be found. This test cannot be checked in a automated fashion and you must check it manually" do
      skip "File '#{test_file}' cannot be found. This check must be performed manually"
    end
  end
end

