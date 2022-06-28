# -*- encoding : utf-8 -*-
control "V-72051" do
  title "The Red Hat Enterprise Linux operating system must have cron logging
implemented."
  desc  "Cron logging can be used to trace the successful or unsuccessful
execution of cron jobs. It can also be used to spot intrusions into the use of
the cron facility by unauthorized and malicious users."
  desc  "rationale", ""
  desc  "check", "
    Verify that \"rsyslog\" is configured to log cron events.

    Check the configuration of \"/etc/rsyslog.conf\" or
\"/etc/rsyslog.d/*.conf\" files for the cron facility with the following
command:

    Note: If another logging package is used, substitute the utility
configuration file for \"/etc/rsyslog.conf\" or \"/etc/rsyslog.d/*.conf\" files.

    # grep cron /etc/rsyslog.conf  /etc/rsyslog.d/*.conf
    cron.* /var/log/cron.log

    If the command does not return a response, check for cron logging all
facilities by inspecting the \"/etc/rsyslog.conf\" or \"/etc/rsyslog.d/*.conf\"
files.

    Look for the following entry:

    *.* /var/log/messages

    If \"rsyslog\" is not logging messages for the cron facility or all
facilities, this is a finding.
  "
  desc  "fix", "
    Configure \"rsyslog\" to log all cron messages by adding or updating the
following line to \"/etc/rsyslog.conf\" or a configuration file in the
/etc/rsyslog.d/ directory:

    cron.* /var/log/cron.log
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72051"
  tag rid: "SV-86675r2_rule"
  tag stig_id: "RHEL-07-021100"
  tag fix_id: "F-78403r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  log_pkg_path = input('log_pkg_path')

  describe.one do
    describe command("grep cron #{log_pkg_path}") do
      its('stdout.strip') { should match %r{^cron} }
    end
    describe file("#{log_pkg_path}") do
      its('content') { should match %r{^\*\.\* \/var\/log\/messages\n?$} }
      its('content') { should_not match %r{^*.*\s+~$.*^*\.\* \/var\/log\/messages\n?$}m }
    end
  end
end

