# -*- encoding : utf-8 -*-
control "V-72287" do
  title "The Red Hat Enterprise Linux operating system must not respond to
Internet Protocol version 4 (IPv4) Internet Control Message Protocol (ICMP)
echoes sent to a broadcast address."
  desc  "Responding to broadcast (ICMP) echoes facilitates network mapping and
provides a vector for amplification attacks."
  desc  "rationale", ""
  desc  "check", "
    Verify the system does not respond to IPv4 ICMP echoes sent to a broadcast
address.

    # grep net.ipv4.icmp_echo_ignore_broadcasts /etc/sysctl.conf /etc/sysctl.d/*

    If \" net.ipv4.icmp_echo_ignore_broadcasts\" is not configured in the
/etc/sysctl.conf file or in the /etc/sysctl.d/ directory, is commented out, or
does not have a value of \"1\", this is a finding.

    Check that the operating system implements the
\"icmp_echo_ignore_broadcasts\" variable with the following command:

    # /sbin/sysctl -a | grep net.ipv4.icmp_echo_ignore_broadcasts
    net.ipv4.icmp_echo_ignore_broadcasts = 1

    If the returned line does not have a value of \"1\", this is a finding.
  "
  desc  "fix", "
    Set the system to the required kernel parameter by adding the following
line to \"/etc/sysctl.conf\" or a configuration file in the /etc/sysctl.d/
directory (or modify the line to have the required value):

    net.ipv4.icmp_echo_ignore_broadcasts = 1

    Issue the following command to make the changes take effect:

    # sysctl --system
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72287"
  tag rid: "SV-86911r2_rule"
  tag stig_id: "RHEL-07-040630"
  tag fix_id: "F-78641r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  describe kernel_parameter('net.ipv4.icmp_echo_ignore_broadcasts') do
    its('value') { should eq 1 }
  end
end

