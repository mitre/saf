# -*- encoding : utf-8 -*-
control "V-73157" do
  title "The Red Hat Enterprise Linux operating system must prevent a user from
overriding the session idle-delay setting for the graphical user interface."
  desc  "A session time-out lock is a temporary action taken when a user stops
work and moves away from the immediate physical vicinity of the information
system but does not log out because of the temporary nature of the absence.
Rather than relying on the user to manually lock their operating system session
prior to vacating the vicinity, operating systems need to be able to identify
when a user's session has idled and take action to initiate the session lock.

    The session lock is implemented at the point where session activity can be
determined and/or controlled.
  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system prevents a user from overriding session idle
delay after a 15-minute period of inactivity for graphical user interfaces.

    Note: If the system does not have GNOME installed, this requirement is Not
Applicable. The screen program must be installed to lock sessions on the
console.

    Determine which profile the system database is using with the following
command:
    # grep system-db /etc/dconf/profile/user

    system-db:local

    Check for the session idle delay setting with the following command:

    Note: The example below is using the database \"local\" for the system, so
the path is \"/etc/dconf/db/local.d\". This path must be modified if a database
other than \"local\" is being used.

    # grep -i idle-delay /etc/dconf/db/local.d/locks/*

    /org/gnome/desktop/session/idle-delay

    If the command does not return a result, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to prevent a user from overriding a session
lock after a 15-minute period of inactivity for graphical user interfaces.

    Create a database to contain the system-wide screensaver settings (if it
does not already exist) with the following command:

    Note: The example below is using the database \"local\" for the system, so
if the system is using another database in /etc/dconf/profile/user, the file
should be created under the appropriate subdirectory.

    # touch /etc/dconf/db/local.d/locks/session

    Add the setting to lock the session idle delay:

    /org/gnome/desktop/session/idle-delay
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000029-GPOS-00010"
  tag gid: "V-73157"
  tag rid: "SV-87809r4_rule"
  tag stig_id: "RHEL-07-010082"
  tag fix_id: "F-79603r1_fix"
  tag cci: ["CCI-000057"]
  tag nist: ["AC-11 a"]

  unless package('gnome-desktop3').installed?
    impact 0.0
    describe "The GNOME desktop is not installed" do
      skip "The GNOME desktop is not installed, this control is Not Applicable."
    end
  else
    describe command("gsettings writable org.gnome.desktop.session idle-delay") do
      its('stdout.strip') { should cmp 'false' }
    end
  end
end
