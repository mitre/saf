# -*- encoding : utf-8 -*-
control "V-71993" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that the x86 Ctrl-Alt-Delete key sequence is disabled on the command line."
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

    Check that the ctrl-alt-del.target is masked and not active with the
following command:

    # systemctl status ctrl-alt-del.target

    ctrl-alt-del.target
    Loaded: masked (/dev/null; bad)
    Active: inactive (dead)

    If the ctrl-alt-del.target is not masked, this is a finding.

    If the ctrl-alt-del.target is active, this is a finding.
  "
  desc  "fix", "
    Configure the system to disable the Ctrl-Alt-Delete sequence for the
command line with the following command:

    # systemctl mask ctrl-alt-del.target
  "
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-71993"
  tag rid: "SV-86617r5_rule"
  tag stig_id: "RHEL-07-020230"
  tag fix_id: "F-78345r6_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  describe systemd_service('ctrl-alt-del.target') do
    it { should_not be_running }
    it { should_not be_enabled }
  end
end

