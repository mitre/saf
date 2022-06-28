# -*- encoding : utf-8 -*-
control "V-71983" do
  title "The Red Hat Enterprise Linux operating system must be configured to
disable USB mass storage."
  desc  "USB mass storage permits easy introduction of unknown devices, thereby
facilitating malicious activity.


  "
  desc  "rationale", ""
  desc  "check", "
    If there is an HBSS with a Device Control Module and a Data Loss Prevention
mechanism, this requirement is not applicable.

    Verify the operating system disables the ability to load the USB Storage
kernel module.

    # grep -r usb-storage /etc/modprobe.d/* | grep -i \"/bin/true\" | grep -v
\"^#\"

    install usb-storage /bin/true

    If the command does not return any output, or the line is commented out,
and use of USB Storage is not documented with the Information System Security
Officer (ISSO) as an operational requirement, this is a finding.

    Verify the operating system disables the ability to use USB mass storage
devices.

    Check to see if USB mass storage is disabled with the following command:

    # grep usb-storage /etc/modprobe.d/* | grep -i \"blacklist\" | grep -v
\"^#\"
    blacklist usb-storage

    If the command does not return any output or the output is not \"blacklist
usb-storage\", and use of USB storage devices is not documented with the
Information System Security Officer (ISSO) as an operational requirement, this
is a finding.
  "
  desc  "fix", "
    Configure the operating system to disable the ability to use the USB
Storage kernel module.

    Create a file under \"/etc/modprobe.d\" with the following command:

    # touch /etc/modprobe.d/usb-storage.conf

    Add the following line to the created file:

    install usb-storage /bin/true

    Configure the operating system to disable the ability to use USB mass
storage devices.

    # vi /etc/modprobe.d/blacklist.conf

    Add or update the line:

    blacklist usb-storage
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000114-GPOS-00059"
  tag satisfies: ["SRG-OS-000114-GPOS-00059", "SRG-OS-000378-GPOS-00163",
"SRG-OS-000480-GPOS-00227"]
  tag gid: "V-71983"
  tag rid: "SV-86607r4_rule"
  tag stig_id: "RHEL-07-020100"
  tag fix_id: "F-78335r4_fix"
  tag cci: ["CCI-000366", "CCI-000778", "CCI-001958"]
  tag nist: ["CM-6 b", "IA-3", "IA-3"]

  unless input('data_loss_prevention_installed')
    impact 0.0
    describe "The system is not using an HBSS with a Device Control Module and a Data Loss Prevention mechanism" do
      skip "The system is not using an HBSS with a Device Control Module and a Data Loss Prevention mechanism, this control is Not Applicable."
    end
  else
    describe kernel_module('usb_storage') do
      it { should_not be_loaded }
      it { should be_blacklisted }
    end
  end
end

