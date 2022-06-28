# -*- encoding : utf-8 -*-
control "V-72289" do
  title "The Red Hat Enterprise Linux operating system must prevent Internet
Protocol version 4 (IPv4) Internet Control Message Protocol (ICMP) redirect
messages from being accepted."
  desc  "ICMP redirect messages are used by routers to inform hosts that a more
direct route exists for a particular destination. These messages modify the
host's route table and are unauthenticated. An illicit ICMP redirect message
could result in a man-in-the-middle attack."
  desc  "rationale", ""
  desc  "check", "
    Verify the system will not accept IPv4 ICMP redirect messages.

    # grep 'net.ipv4.conf.default.accept_redirects' /etc/sysctl.conf
/etc/sysctl.d/*

    If \" net.ipv4.conf.default.accept_redirects \" is not configured in the
/etc/sysctl.conf file or in the /etc/sysctl.d/ directory, is commented out, or
does not have a value of \"0\", this is a finding.

    Check that the operating system implements the value of the
\"accept_redirects\" variables with the following command:

    # /sbin/sysctl -a | grep 'net.ipv4.conf.default.accept_redirects'
    net.ipv4.conf.default.accept_redirects = 0

    If the returned line does not have a value of \"0\", this is a finding.
  "
  desc  "fix", "
    Set the system to not accept IPv4 ICMP redirect messages by adding the
following line to \"/etc/sysctl.conf\" or a configuration file in the
/etc/sysctl.d/ directory (or modify the line to have the required value):

    net.ipv4.conf.default.accept_redirects = 0

    Issue the following command to make the changes take effect:

    # sysctl --system
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72289"
  tag rid: "SV-86913r3_rule"
  tag stig_id: "RHEL-07-040640"
  tag fix_id: "F-78643r3_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  describe kernel_parameter('net.ipv4.conf.default.accept_redirects') do
    its('value') { should eq 0 }
  end
end

