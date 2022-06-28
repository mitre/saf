# -*- encoding : utf-8 -*-
control "V-72297" do
  title "The Red Hat Enterprise Linux operating system must be configured to
prevent unrestricted mail relaying."
  desc  "If unrestricted mail relaying is permitted, unauthorized senders could
use this host as a mail relay for the purpose of sending spam or other
unauthorized activity."
  desc  "rationale", ""
  desc  "check", "
    Verify the system is configured to prevent unrestricted mail relaying.

    Determine if \"postfix\" is installed with the following commands:

    # yum list installed postfix
    postfix-2.6.6-6.el7.x86_64.rpm

    If postfix is not installed, this is Not Applicable.

    If postfix is installed, determine if it is configured to reject
connections from unknown or untrusted networks with the following command:

    # postconf -n smtpd_client_restrictions
    smtpd_client_restrictions = permit_mynetworks, reject

    If the \"smtpd_client_restrictions\" parameter contains any entries other
than \"permit_mynetworks\" and \"reject\", this is a finding.
  "
  desc  "fix", "
    If \"postfix\" is installed, modify the \"/etc/postfix/main.cf\" file to
restrict client connections to the local network with the following command:

    # postconf -e 'smtpd_client_restrictions = permit_mynetworks,reject'
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72297"
  tag rid: "SV-86921r3_rule"
  tag stig_id: "RHEL-07-040680"
  tag fix_id: "F-78651r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  # Only permit_mynetworks and reject should be allowed
  describe.one do
    describe command('postconf -n smtpd_client_restrictions') do
      its('stdout.strip') { should match %r{^smtpd_client_restrictions\s+=\s+permit_mynetworks,\s*reject\s*$} }
    end
    describe command('postconf -n smtpd_client_restrictions') do
      its('stdout.strip') { should match %r{^smtpd_client_restrictions\s+=\s+permit_mynetworks\s*$} }
    end
    describe command('postconf -n smtpd_client_restrictions') do
      its('stdout.strip') { should match %r{^smtpd_client_restrictions\s+=\s+reject\s*$} }
    end
    describe command('postconf -n smtpd_client_restrictions') do
      its('stdout.strip') { should match %r{^smtpd_client_restrictions\s+=\s+reject,\s*permit_mynetworks\s*$} }
    end
  end if package('postfix').installed?

  describe "The `postfix` package is not installed" do
    skip "The `postfix` package is not installed, this control is Not Applicable"
  end if !package('postfix').installed?
end

