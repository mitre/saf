# -*- encoding : utf-8 -*-
control "V-72319" do
  title "The Red Hat Enterprise Linux operating system must not forward IPv6
source-routed packets."
  desc  "Source-routed packets allow the source of the packet to suggest that
routers forward the packet along a different path than configured on the
router, which can be used to bypass network security measures. This requirement
applies only to the forwarding of source-routed traffic, such as when IPv6
forwarding is enabled and the system is functioning as a router."
  desc  "rationale", ""
  desc  "check", "
    If IPv6 is not enabled, the key will not exist, and this is Not Applicable.

    Verify the system does not accept IPv6 source-routed packets.

    # grep net.ipv6.conf.all.accept_source_route /etc/sysctl.conf
/etc/sysctl.d/*

    net.ipv6.conf.all.accept_source_route = 0

    If \"net.ipv6.conf.all.accept_source_route\" is not configured in the
/etc/sysctl.conf file or in the /etc/sysctl.d/ directory, is commented out or
does not have a value of \"0\", this is a finding.

    Check that the operating system implements the accept source route variable
with the following command:

    # /sbin/sysctl -a | grep net.ipv6.conf.all.accept_source_route
    net.ipv6.conf.all.accept_source_route = 0

    If the returned lines do not have a value of \"0\", this is a finding.
  "
  desc  "fix", "
    Set the system to the required kernel parameter, if IPv6 is enabled, by
adding the following line to \"/etc/sysctl.conf\" or a configuration file in
the /etc/sysctl.d/ directory (or modify the line to have the required value):

    net.ipv6.conf.all.accept_source_route = 0

    Issue the following command to make the changes take effect:

    # sysctl --system
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72319"
  tag rid: "SV-86943r2_rule"
  tag stig_id: "RHEL-07-040830"
  tag fix_id: "F-78673r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  describe.one do
    describe kernel_parameter('net.ipv6.conf.all.accept_source_route') do
      its('value') { should eq 0 }
    end
	# If IPv6 is disabled in the kernel it will return NIL
    describe kernel_parameter('net.ipv6.conf.all.accept_source_route') do
      its('value') { should eq nil }
    end
  end
end

