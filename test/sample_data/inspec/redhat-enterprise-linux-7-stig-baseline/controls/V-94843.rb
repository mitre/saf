# -*- encoding : utf-8 -*-
control "V-94843" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that the x86 Ctrl-Alt-Delete key sequence is disabled in the GUI."
  desc  "A locally logged-on user who presses Ctrl-Alt-Delete, when at the
console, can reboot the system. If accidentally pressed, as could happen in the
case of a mixed OS environment, this can create the risk of short-term loss of
availability of systems due to unintentional reboot. In the GNOME graphical
environment, risk of unintentional reboot from the Ctrl-Alt-Delete sequence is
reduced because the user will be prompted before any action is taken."
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system is not configured to reboot the system when
Ctrl-Alt-Delete is pressed.

    Check that the ctrl-alt-del.target is masked and not active in the GUI with
the following command:

    # grep logout /etc/dconf/local.d/*

    logout=''

    If \"logout\" is not set to use two single quotations, or is missing, this
is a finding.
  "
  desc  "fix", "
    Configure the system to disable the Ctrl-Alt-Delete sequence for the GUI
with the following command:

    # touch /etc/dconf/db/local.d/00-disable-CAD

    Add the setting to disable the Ctrl-Alt-Delete sequence for GNOME:

    [org/gnome/settings-daemon/plugins/media-keys]
    logout=''
  "
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-94843"
  tag rid: "SV-104673r1_rule"
  tag stig_id: "RHEL-07-020231"
  tag fix_id: "F-100967r1_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  unless package('gnome-settings-daemon').installed?
    impact 0.0
    describe "The system does not have GNOME installed" do
      skip "The system does not have GNOME installed, this requirement is Not
      Applicable."
    end
  else 
    describe command("gsettings get org.gnome.settings-daemon.media-keys logout") do
      its('stdout.strip') { should cmp "''" }
    end 
  end
end

