# -*- encoding : utf-8 -*-
control "V-72209" do
  title "The Red Hat Enterprise Linux operating system must send rsyslog output
to a log aggregation server."
  desc  "Sending rsyslog output to another system ensures that the logs cannot
be removed or modified in the event that the system is compromised or has a
hardware failure."
  desc  "rationale", ""
  desc  "check", "
    Verify \"rsyslog\" is configured to send all messages to a log aggregation
server.

    Check the configuration of \"rsyslog\" with the following command:

    Note: If another logging package is used, substitute the utility
configuration file for \"/etc/rsyslog.conf\".

    # grep @ /etc/rsyslog.conf /etc/rsyslog.d/*.conf
    *.* @@logagg.site.mil

    If there are no lines in the \"/etc/rsyslog.conf\" or
\"/etc/rsyslog.d/*.conf\" files that contain the \"@\" or \"@@\" symbol(s), and
the lines with the correct symbol(s) to send output to another system do not
cover all \"rsyslog\" output, ask the System Administrator to indicate how the
audit logs are off-loaded to a different system or media.

    If the lines are commented out or there is no evidence that the audit logs
are being sent to another system, this is a finding.
  "
  desc  "fix", "
    Modify the \"/etc/rsyslog.conf\" or an \"/etc/rsyslog.d/*.conf\" file to
contain a configuration line to send all \"rsyslog\" output to a log
aggregation system:
    *.* @@<log aggregation system name>
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72209"
  tag rid: "SV-86833r2_rule"
  tag stig_id: "RHEL-07-031000"
  tag fix_id: "F-78563r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]


  if input('alternate_logs')
    describe "An alternate logging system is used. This test cannot be checked in a automated fashion and you must check it manually" do
      skip "An alternate logging system is used. This check must be performed manually"
    end
  else
    describe command("grep @ #{input('log_pkg_path')} | grep -v \"^#\"") do
      its('stdout.strip') { should_not be_empty }
    end
  end
end

