# -*- encoding : utf-8 -*-
control "V-72303" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that remote X connections for interactive users are encrypted."
  desc  "Open X displays allow an attacker to capture keystrokes and execute
commands remotely."
  desc  "rationale", ""
  desc  "check", "
    Verify remote X connections for interactive users are encrypted.

    Check that remote X connections are encrypted with the following command:

    # grep -i x11forwarding /etc/ssh/sshd_config | grep -v \"^#\"

    X11Forwarding yes

    If the \"X11Forwarding\" keyword is set to \"no\" or is missing, this is a
finding.
  "
  desc  "fix", "
    Configure SSH to encrypt connections for interactive users.

    Edit the \"/etc/ssh/sshd_config\" file to uncomment or add the line for the
\"X11Forwarding\" keyword and set its value to \"yes\" (this file may be named
differently or be in a different location if using a version of SSH that is
provided by a third-party vendor):

    X11Forwarding yes

    The SSH service must be restarted for changes to take effect:

    # systemctl restart sshd
  "
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72303"
  tag rid: "SV-86927r4_rule"
  tag stig_id: "RHEL-07-040710"
  tag fix_id: "F-78657r6_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  describe sshd_config do
    its('X11Forwarding') { should cmp 'yes' }
  end
end

