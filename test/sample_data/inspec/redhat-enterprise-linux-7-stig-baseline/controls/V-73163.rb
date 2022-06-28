# -*- encoding : utf-8 -*-
control "V-73163" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that the audit system takes appropriate action when there is an error sending
audit records to a remote system."
  desc  "Taking appropriate action when there is an error sending audit records
to a remote system will minimize the possibility of losing audit records."
  desc  "rationale", ""
  desc  "check", "
    Verify the action the operating system takes if there is an error sending
audit records to a remote system.

    Check the action that takes place if there is an error sending audit
records to a remote system with the following command:

    # grep -i network_failure_action /etc/audisp/audisp-remote.conf
    network_failure_action = syslog

    If the value of the \"network_failure_action\" option is not \"syslog\",
\"single\", or \"halt\", or the line is commented out, this is a finding.
  "
  desc  "fix", "
    Configure the action the operating system takes if there is an error
sending audit records to a remote system.

    Uncomment the \"network_failure_action\" option in
\"/etc/audisp/audisp-remote.conf\" and set it to \"syslog\", \"single\", or
\"halt\".

    network_failure_action = syslog
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000342-GPOS-00133"
  tag gid: "V-73163"
  tag rid: "SV-87815r3_rule"
  tag stig_id: "RHEL-07-030321"
  tag fix_id: "F-79609r2_fix"
  tag cci: ["CCI-001851"]
  tag nist: ["AU-4 (1)"]

  describe parse_config_file('/etc/audisp/audisp-remote.conf') do
    its('network_failure_action'.to_s) { should be_in ['syslog', 'single', 'halt'] }
  end
end

