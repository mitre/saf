# -*- encoding : utf-8 -*-
control "V-72265" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that the SSH daemon uses privilege separation."
  desc  "SSH daemon privilege separation causes the SSH process to drop root
privileges when not needed, which would decrease the impact of software
vulnerabilities in the unprivileged section."
  desc  "rationale", ""
  desc  "check", "
    Verify the SSH daemon performs privilege separation.

    Check that the SSH daemon performs privilege separation with the following
command:

    # grep -i usepriv /etc/ssh/sshd_config

    UsePrivilegeSeparation sandbox

    If the \"UsePrivilegeSeparation\" keyword is set to \"no\", is missing, or
the returned line is commented out, this is a finding.
  "
  desc  "fix", "
    Uncomment the \"UsePrivilegeSeparation\" keyword in
\"/etc/ssh/sshd_config\" (this file may be named differently or be in a
different location if using a version of SSH that is provided by a third-party
vendor) and set the value to \"sandbox\" or \"yes\":

    UsePrivilegeSeparation sandbox

    The SSH service must be restarted for changes to take effect.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72265"
  tag rid: "SV-86889r3_rule"
  tag stig_id: "RHEL-07-040460"
  tag fix_id: "F-78619r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  describe.one do
    describe sshd_config do
      its('UsePrivilegeSeparation') { should cmp 'sandbox' }
    end
    describe sshd_config do
      its('UsePrivilegeSeparation') { should cmp 'yes' }
    end
  end
end

