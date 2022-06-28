# -*- encoding : utf-8 -*-
control "V-72273" do
  title "The Red Hat Enterprise Linux operating system must enable an
application firewall, if available."
  desc  "Firewalls protect computers from network attacks by blocking or
limiting access to open network ports. Application firewalls limit which
applications are allowed to communicate over the network.


  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system enabled an application firewall.

    Check to see if \"firewalld\" is installed with the following command:

    # yum list installed firewalld
    firewalld-0.3.9-11.el7.noarch.rpm

    If the \"firewalld\" package is not installed, ask the System Administrator
if another firewall application (such as iptables) is installed.

    If an application firewall is not installed, this is a finding.

    Check to see if the firewall is loaded and active with the following
command:

    # systemctl status firewalld
    firewalld.service - firewalld - dynamic firewall daemon

       Loaded: loaded (/usr/lib/systemd/system/firewalld.service; enabled)
       Active: active (running) since Tue 2014-06-17 11:14:49 CEST; 5 days ago

    If \"firewalld\" does not show a status of \"loaded\" and \"active\", this
is a finding.

    Check the state of the firewall:

    # firewall-cmd --state
    running

    If \"firewalld\" does not show a state of \"running\", this is a finding.
  "
  desc  "fix", "
    Ensure the operating system's application firewall is enabled.

    Install the \"firewalld\" package, if it is not on the system, with the
following command:

    # yum install firewalld

    Start the firewall via \"systemctl\" with the following command:

    # systemctl start firewalld
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag satisfies: ["SRG-OS-000480-GPOS-00227", "SRG-OS-000480-GPOS-00231",
"SRG-OS-000480-GPOS-00232"]
  tag gid: "V-72273"
  tag rid: "SV-86897r2_rule"
  tag stig_id: "RHEL-07-040520"
  tag fix_id: "F-78627r1_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  describe.one do
    describe package('firewalld') do
      it { should be_installed }
    end
    describe package('iptables') do
      it { should be_installed }
    end
  end
  describe.one do
    describe systemd_service('firewalld.service') do
      it { should be_running }
    end
	describe systemd_service('iptables.service') do
      it { should be_running }
    end
  end
end

