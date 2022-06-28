# -*- encoding : utf-8 -*-
control "V-71891" do
  title "The Red Hat Enterprise Linux operating system must enable a user
session lock until that user re-establishes access using established
identification and authentication procedures."
  desc  "A session lock is a temporary action taken when a user stops work and
moves away from the immediate physical vicinity of the information system but
does not want to log out because of the temporary nature of the absence.

    The session lock is implemented at the point where session activity can be
determined.

    Regardless of where the session lock is determined and implemented, once
invoked, the session lock must remain in place until the user reauthenticates.
No other activity aside from reauthentication must unlock the system.


  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system enables a user's session lock until that user
re-establishes access using established identification and authentication
procedures. The screen program must be installed to lock sessions on the
console.

    Note: If the system does not have GNOME installed, this requirement is Not
Applicable.

    Check to see if the screen lock is enabled with the following command:

    # grep -i lock-enabled /etc/dconf/db/local.d/*
    lock-enabled=true

    If the \"lock-enabled\" setting is missing or is not set to \"true\", this
is a finding.
  "
  desc  "fix", "
    Configure the operating system to enable a user's session lock until that
user re-establishes access using established identification and authentication
procedures.

    Create a database to contain the system-wide screensaver settings (if it
does not already exist) with the following example:

    # touch /etc/dconf/db/local.d/00-screensaver

    Edit the \"[org/gnome/desktop/screensaver]\" section of the database file
and add or update the following lines:

    # Set this to true to lock the screen when the screensaver activates
    lock-enabled=true

    Update the system databases:

    # dconf update

    Users must log out and back in again before the system-wide settings take
effect.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000028-GPOS-00009"
  tag satisfies: ["SRG-OS-000028-GPOS-00009", "SRG-OS-000030-GPOS-00011"]
  tag gid: "V-71891"
  tag rid: "SV-86515r6_rule"
  tag stig_id: "RHEL-07-010060"
  tag fix_id: "F-78243r9_fix"
  tag cci: ["CCI-000056"]
  tag nist: ["AC-11 b"]

  if package('gnome-desktop3').installed?
    describe command('gsettings get org.gnome.desktop.screensaver lock-enabled') do
      its('stdout.strip') { should cmp 'true' }
    end
  else
    impact 0.0
    describe "The system does not have GNOME installed" do
      skip "The system does not have GNOME installed, this requirement is Not
      Applicable."
    end
  end
end

