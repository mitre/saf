# -*- encoding : utf-8 -*-
control "V-72245" do
  title "The Red Hat Enterprise Linux operating system must display the date
and time of the last successful account logon upon an SSH logon."
  desc  "Providing users with feedback on when account accesses via SSH last
occurred facilitates user recognition and reporting of unauthorized account
use."
  desc  "rationale", ""
  desc  "check", "
    Verify SSH provides users with feedback on when account accesses last
occurred.

    Check that \"PrintLastLog\" keyword in the sshd daemon configuration file
is used and set to \"yes\" with the following command:

    # grep -i printlastlog /etc/ssh/sshd_config
    PrintLastLog yes

    If the \"PrintLastLog\" keyword is set to \"no\", is missing, or is
commented out, this is a finding.
  "
  desc  "fix", "
    Configure SSH to provide users with feedback on when account accesses last
occurred by setting the required configuration options in \"/etc/pam.d/sshd\"
or in the \"sshd_config\" file used by the system (\"/etc/ssh/sshd_config\"
will be used in the example) (this file may be named differently or be in a
different location if using a version of SSH that is provided by a third-party
vendor).

    Modify the \"PrintLastLog\" line in \"/etc/ssh/sshd_config\" to match the
following:

    PrintLastLog yes

    The SSH service must be restarted for changes to \"sshd_config\" to take
effect.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72245"
  tag rid: "SV-86869r3_rule"
  tag stig_id: "RHEL-07-040360"
  tag fix_id: "F-78599r3_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  if sshd_config.params['printlastlog'] == ['yes']
    describe sshd_config do
      its('PrintLastLog') { should cmp 'yes' }
    end
  else
    describe pam('/etc/pam.d/sshd') do
      its('lines') { should match_pam_rule('session required pam_lastlog.so showfailed') }
      its('lines') { should match_pam_rule('session required pam_lastlog.so showfailed').all_without_args('silent') }
    end
  end
end

