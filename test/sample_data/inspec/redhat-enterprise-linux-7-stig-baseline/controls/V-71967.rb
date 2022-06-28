# -*- encoding : utf-8 -*-
control "V-71967" do
  title "The Red Hat Enterprise Linux operating system must not have the
rsh-server package installed."
  desc  "It is detrimental for operating systems to provide, or install by
default, functionality exceeding requirements or mission objectives. These
unnecessary capabilities or services are often overlooked and therefore may
remain unsecured. They increase the risk to the platform by providing
additional attack vectors.

    Operating systems are capable of providing a wide variety of functions and
services. Some of the functions and services, provided by default, may not be
necessary to support essential organizational operations (e.g., key missions,
functions).

    The rsh-server service provides an unencrypted remote access service that
does not provide for the confidentiality and integrity of user passwords or the
remote session and has very weak authentication.

    If a privileged user were to log on using this service, the privileged user
password could be compromised.
  "
  desc  "rationale", ""
  desc  "check", "
    Check to see if the rsh-server package is installed with the following
command:

    # yum list installed rsh-server

    If the rsh-server package is installed, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to disable non-essential capabilities by
removing the rsh-server package from the system with the following command:

    # yum remove rsh-server
  "
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000095-GPOS-00049"
  tag gid: "V-71967"
  tag rid: "SV-86591r2_rule"
  tag stig_id: "RHEL-07-020000"
  tag fix_id: "F-78319r1_fix"
  tag cci: ["CCI-000381"]
  tag nist: ["CM-7 a"]

  describe package("rsh-server") do
    it { should_not be_installed }
  end
end

