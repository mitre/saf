# -*- encoding : utf-8 -*-
control "V-72305" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that if the Trivial File Transfer Protocol (TFTP) server is required, the TFTP
daemon is configured to operate in secure mode."
  desc  "Restricting TFTP to a specific directory prevents remote users from
copying, transferring, or overwriting system files."
  desc  "rationale", ""
  desc  "check", "
    Verify the TFTP daemon is configured to operate in secure mode.

    Check to see if a TFTP server has been installed with the following
commands:

    # yum list installed tftp-server
    tftp-server.x86_64 x.x-x.el7 rhel-7-server-rpms

    If a TFTP server is not installed, this is Not Applicable.

    If a TFTP server is installed, check for the server arguments with the
following command:

    # grep server_args /etc/xinetd.d/tftp
    server_args = -s /var/lib/tftpboot

    If the \"server_args\" line does not have a \"-s\" option and a
subdirectory is not assigned, this is a finding.
  "
  desc  "fix", "
    Configure the TFTP daemon to operate in secure mode by adding the following
line to \"/etc/xinetd.d/tftp\" (or modify the line to have the required value):

    server_args = -s /var/lib/tftpboot
  "
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72305"
  tag rid: "SV-86929r3_rule"
  tag stig_id: "RHEL-07-040720"
  tag fix_id: "F-78659r1_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  if package('tftp-server').installed?
    impact 0.5
    describe command('grep server_args /etc/xinetd.d/tftp') do
      its('stdout.strip') { should match %r{^\s*server_args\s+=\s+(-s|--secure)\s(\/\S+)$} }
    end
  else
    impact 0.0
    describe "The TFTP package is not installed" do
      skip "If a TFTP server is not installed, this is Not Applicable."
    end
  end
end

