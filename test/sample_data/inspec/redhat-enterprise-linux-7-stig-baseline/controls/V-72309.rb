# -*- encoding : utf-8 -*-
control "V-72309" do
  title "The Red Hat Enterprise Linux operating system must not be performing
packet forwarding unless the system is a router."
  desc  "Routing protocol daemons are typically used on routers to exchange
network topology information with other routers. If this software is used when
not required, system network information may be unnecessarily transmitted
across the network."
  desc  "rationale", ""
  desc  "check", "
    Verify the system is not performing packet forwarding, unless the system is
a router.

    # grep net.ipv4.ip_forward /etc/sysctl.conf /etc/sysctl.d/*

    net.ipv4.ip_forward = 0

    If \"net.ipv4.ip_forward\" is not configured in the /etc/sysctl.conf file
or in the /etc/sysctl.d/ directory, is commented out, or does not have a value
of \"0\", this is a finding.

    Check that the operating system does not implement IP forwarding using the
following command:

    # /sbin/sysctl -a | grep net.ipv4.ip_forward
    net.ipv4.ip_forward = 0

    If IP forwarding value is \"1\" and the system is hosting any application,
database, or web servers, this is a finding.
  "
  desc  "fix", "
    Set the system to the required kernel parameter by adding the following
line to \"/etc/sysctl.conf\" or a configuration file in the /etc/sysctl.d/
directory (or modify the line to have the required value):

    net.ipv4.ip_forward = 0

    Issue the following command to make the changes take effect:

    # sysctl --system
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72309"
  tag rid: "SV-86933r2_rule"
  tag stig_id: "RHEL-07-040740"
  tag fix_id: "F-78663r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  describe kernel_parameter('net.ipv4.ip_forward') do
    its('value') { should eq 0 }
  end
end

