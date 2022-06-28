# -*- encoding : utf-8 -*-
control "V-71897" do
  title "The Red Hat Enterprise Linux operating system must have the screen
package installed."
  desc  ":  A session time-out lock is a temporary action taken when a user
stops work and moves away from the immediate physical vicinity of the
information system but does not log out because of the temporary nature of the
absence. Rather than relying on the user to manually lock their operating
system session prior to vacating the vicinity, operating systems need to be
able to identify when a user's session has idled and take action to initiate
the session lock.

    The screen and tmux packages allow for a session lock to be implemented and
configured.

  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system has the screen package installed.

    Check to see if the screen package is installed with the following command:

    # yum list installed screen
    screen-4.3.1-3-x86_64.rpm

    If the screen package is not installed, check to see if the tmux package is
installed with the following command:

    #yum list installed tmux
    tmux-1.8-4.el7.x86_64.rpm

    If either the screen package or the tmux package is not installed, this is
a finding.
  "
  desc  "fix", "
    Install the screen package to allow the initiation of a session lock after
a 15-minute period of inactivity.

    Install the screen program (if it is not on the system) with the following
command:

    # yum install screen

    OR

    Install the tmux program (if it is not on the system) with the following
command:

    #yum install tmux
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000029-GPOS-00010"
  tag gid: "V-71897"
  tag rid: "SV-86521r3_rule"
  tag stig_id: "RHEL-07-010090"
  tag fix_id: "F-78249r3_fix"
  tag cci: ["CCI-000057"]
  tag nist: ["AC-11 a"]

  multiplexer_packages = input('terminal_mux_pkgs')

  describe.one do
    multiplexer_packages.each do |pkg|  
      describe package(pkg) do
        it { should be_installed }
      end
    end
  end
end

