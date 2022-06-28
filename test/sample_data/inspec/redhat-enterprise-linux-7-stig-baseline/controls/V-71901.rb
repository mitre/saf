# -*- encoding : utf-8 -*-
control "V-71901" do
  title "The Red Hat Enterprise Linux operating system must initiate a session
lock for graphical user interfaces when the screensaver is activated."
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
    Verify the operating system initiates a session lock a for graphical user
interfaces when the screensaver is activated.

    Note: If the system does not have GNOME installed, this requirement is Not
Applicable. The screen program must be installed to lock sessions on the
console.

    If GNOME is installed, check to see a session lock occurs when the
screensaver is activated with the following command:

    # grep -i lock-delay /etc/dconf/db/local.d/*
    lock-delay=uint32 5

    If the \"lock-delay\" setting is missing, or is not set to \"5\" or less,
this is a finding.
  "
  desc  "fix", "
    Configure the operating system to initiate a session lock for graphical
user interfaces when a screensaver is activated.

    Create a database to contain the system-wide screensaver settings (if it
does not already exist) with the following command:

    # touch /etc/dconf/db/local.d/00-screensaver

    Add the setting to enable session locking when a screensaver is activated:

    [org/gnome/desktop/screensaver]
    lock-delay=uint32 5

    The \"uint32\" must be included along with the integer key values as shown.

    Update the system databases:

    # dconf update

    Users must log out and back in again before the system-wide settings take
effect.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000029-GPOS-00010"
  tag gid: "V-71901"
  tag rid: "SV-86525r3_rule"
  tag stig_id: "RHEL-07-010110"
  tag fix_id: "F-78253r2_fix"
  tag cci: ["CCI-000057"]
  tag nist: ["AC-11 a"]

  if package('gnome-desktop3').installed?
    describe command("gsettings get org.gnome.desktop.screensaver lock-delay | cut -d ' ' -f2") do
      its('stdout.strip') { should cmp <= input('lock_delay') }
    end
  else
    impact 0.0
    describe "The system does not have GNOME installed" do
      skip "The system does not have GNOME installed, this requirement is Not
      Applicable."
    end
  end
end
