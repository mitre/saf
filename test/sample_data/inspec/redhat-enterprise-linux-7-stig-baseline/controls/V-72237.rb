# -*- encoding : utf-8 -*-
control "V-72237" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that all network connections associated with SSH traffic are terminated at the
end of the session or after 10 minutes of inactivity, except to fulfill
documented and validated mission requirements."
  desc  "Terminating an idle SSH session within a short time period reduces the
window of opportunity for unauthorized personnel to take control of a
management session enabled on the console or console port that has been left
unattended. In addition, quickly terminating an idle SSH session will also free
up resources committed by the managed network element.

    Terminating network connections associated with communications sessions
includes, for example, de-allocating associated TCP/IP address/port pairs at
the operating system level and de-allocating networking assignments at the
application level if multiple application sessions are using a single operating
system-level network connection. This does not mean that the operating system
terminates all sessions or network access; it only ends the inactive session
and releases the resources associated with that session.


  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system automatically terminates a user session after
inactivity time-outs have expired.

    Check for the value of the \"ClientAliveInterval\" keyword with the
following command:

    # grep -iw clientaliveinterval /etc/ssh/sshd_config

    ClientAliveInterval 600

    If \"ClientAliveInterval\" is not configured, commented out, or has a value
of \"0\", this is a finding.

    If \"ClientAliveInterval\" has a value that is greater than \"600\" and is
not documented with the Information System Security Officer (ISSO) as an
operational requirement, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to automatically terminate a user session
after inactivity time-outs have expired or at shutdown.

    Add the following line (or modify the line to have the required value) to
the \"/etc/ssh/sshd_config\" file (this file may be named differently or be in
a different location if using a version of SSH that is provided by a
third-party vendor):

    ClientAliveInterval 600

    The SSH service must be restarted for changes to take effect.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000163-GPOS-00072"
  tag satisfies: ["SRG-OS-000163-GPOS-00072", "SRG-OS-000279-GPOS-00109"]
  tag gid: "V-72237"
  tag rid: "SV-86861r4_rule"
  tag stig_id: "RHEL-07-040320"
  tag fix_id: "F-78591r2_fix"
  tag cci: ["CCI-001133", "CCI-002361"]
  tag nist: ["SC-10", "AC-12"]

  client_alive_interval = input('client_alive_interval')

  #This may show slightly confusing results when a ClientAliveInterValue is not
  #specified. Specifically, because the value will be nil and when you try to
  #convert it to an integer using to_i it will convert it to 0 and pass the
  #<= client_alive_interval check. However, the control as a whole will still fail.
  describe sshd_config do
    its("ClientAliveInterval.to_i"){should cmp >= 1}
    its("ClientAliveInterval.to_i"){should cmp <= client_alive_interval}
    its("ClientAliveInterval"){should_not eq nil}
  end
end

