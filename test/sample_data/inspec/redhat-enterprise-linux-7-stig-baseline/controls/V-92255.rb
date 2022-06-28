# -*- encoding : utf-8 -*-
control "V-92255" do
  title "The Red Hat Enterprise Linux operating system must have a host-based
intrusion detection tool installed."
  desc  "Adding host-based intrusion detection tools can provide the capability
to automatically take actions in response to malicious behavior, which can
provide additional agility in reacting to network threats. These tools also
often include a reporting capability to provide network awareness of the
system, which may not otherwise exist in an organization's systems management
regime."
  desc  "rationale", ""
  desc  "check", "
    Ask the SA or ISSO if a host-based intrusion detection application is
loaded on the system. Per OPORD 16-0080, the preferred intrusion detection
system is McAfee HBSS available through the U.S. Cyber Command (USCYBERCOM).

    If another host-based intrusion detection application is in use, such as
SELinux, this must be documented and approved by the local Authorizing Official.

    Procedure:
    Examine the system to determine if the Host Intrusion Prevention System
(HIPS) is installed:

    # rpm -qa | grep MFEhiplsm

    Verify that the McAfee HIPS module is active on the system:

    # ps -ef | grep -i “hipclient”

    If the MFEhiplsm package is not installed, check for another intrusion
detection system:

    # find / -name <daemon name>

    Where <daemon name> is the name of the primary application daemon to
determine if the application is loaded on the system.

    Determine if the application is active on the system:

    # ps -ef | grep -i <daemon name>

    If the MFEhiplsm package is not installed and an alternate host-based
intrusion detection application has not been documented for use, this is a
finding.

    If no host-based intrusion detection system is installed and running on the
system, this is a finding.
  "
  desc  "fix", "
    Install and enable the latest McAfee HIPS package, available from
USCYBERCOM.

    Note: If the system does not support the McAfee HIPS package, install and
enable a supported intrusion detection system application and document its use
with the Authorizing Official.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000196"
  tag gid: "V-92255"
  tag rid: "SV-102357r1_rule"
  tag stig_id: "RHEL-07-020019"
  tag fix_id: "F-98477r1_fix"
  tag cci: ["CCI-001263"]
  tag nist: ["SI-4 (5)"]

  custom_hips = input('custom_hips')

  if ! custom_hips
    describe package('MFEhiplsm') do
      it { should be_installed }
    end
    describe processes(/hipclient/) do
      it { should exist }
    end
  else
    # Special case for SELinux
    sel_mode = command('getenforce').stdout.strip
    custom_hips_daemon = input('custom_hips_daemon')
    max_daemon_processes = input('max_daemon_processes')

    describe.one do
      describe "SELinux mode" do
        subject { sel_mode }
        it { should cmp 'Enforcing' }
      end
      describe processes(/#{custom_hips_daemon}/) do
        it { should exist }
        its('count') { should be < max_daemon_processes }
      end
    end
  end
end

