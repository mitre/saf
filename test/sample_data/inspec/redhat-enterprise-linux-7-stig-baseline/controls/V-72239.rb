# -*- encoding : utf-8 -*-
control "V-72239" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that the SSH daemon does not allow authentication using RSA rhosts
authentication."
  desc  "Configuring this setting for the SSH daemon provides additional
assurance that remote logon via SSH will require a password, even in the event
of misconfiguration elsewhere."
  desc  "rationale", ""
  desc  "check", "
    Check the version of the operating system with the following command:

    # cat /etc/redhat-release

    If the release is 7.4 or newer this requirement is Not Applicable.

    Verify the SSH daemon does not allow authentication using RSA rhosts
authentication.

    To determine how the SSH daemon's \"RhostsRSAAuthentication\" option is
set, run the following command:

    # grep RhostsRSAAuthentication /etc/ssh/sshd_config
    RhostsRSAAuthentication no

    If the value is returned as \"yes\", the returned line is commented out, or
no output is returned, this is a finding.
  "
  desc  "fix", "
    Configure the SSH daemon to not allow authentication using RSA rhosts
authentication.

    Add the following line in \"/etc/ssh/sshd_config\", or uncomment the line
and set the value to \"no\":

    RhostsRSAAuthentication no

    The SSH service must be restarted for changes to take effect.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72239"
  tag rid: "SV-86863r4_rule"
  tag stig_id: "RHEL-07-040330"
  tag fix_id: "F-78593r4_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  describe sshd_config do
    its('RhostsRSAAuthentication') { should cmp 'no' }
  end
end

