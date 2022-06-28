# -*- encoding : utf-8 -*-
control "V-71963" do
  title "Red Hat Enterprise Linux operating systems prior to version 7.2 using
Unified Extensible Firmware Interface (UEFI) must require authentication upon
booting into single-user and maintenance modes."
  desc  "If the system does not require valid root authentication before it
boots into single-user or maintenance mode, anyone who invokes single-user or
maintenance mode is granted privileged access to all files on the system. GRUB
2 is the default boot loader for RHEL 7 and is designed to require a password
to boot into single-user mode or make modifications to the boot menu."
  desc  "rationale", ""
  desc  "check", "
    For systems that use BIOS, this is Not Applicable.
    For systems that are running RHEL 7.2 or newer, this is Not Applicable.

    Check to see if an encrypted root password is set. On systems that use
UEFI, use the following command:

    # grep -i password /boot/efi/EFI/redhat/grub.cfg

    password_pbkdf2 [superusers-account] [password-hash]

    If the root password entry does not begin with \"password_pbkdf2\", this is
a finding.

    If the \"superusers-account\" is not set to \"root\", this is a finding.
  "
  desc  "fix", "
    Configure the system to encrypt the boot password for root.

    Generate an encrypted grub2 password for root with the following command:

    Note: The hash generated is an example.

    # grub2-mkpasswd-pbkdf2

    Enter Password:
    Reenter Password:
    PBKDF2 hash of your password is
grub.pbkdf2.sha512.10000.F3A7CFAA5A51EED123BE8238C23B25B2A6909AFC9812F0D45

    Edit \"/etc/grub.d/40_custom\" and add the following lines below the
comments:

    # vi /etc/grub.d/40_custom

    set superusers=\"root\"

    password_pbkdf2 root {hash from grub2-mkpasswd-pbkdf2 command}

    Generate a new \"grub.conf\" file with the new password with the following
commands:

    # grub2-mkconfig --output=/tmp/grub2.cfg
    # mv /tmp/grub2.cfg /boot/efi/EFI/redhat/grub.cfg
  "
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000080-GPOS-00048"
  tag gid: "V-71963"
  tag rid: "SV-86587r4_rule"
  tag stig_id: "RHEL-07-010490"
  tag fix_id: "F-78315r3_fix"
  tag cci: ["CCI-000213"]
  tag nist: ["AC-3"]

  os_minor_version = os().release.split('.')[1].to_i

  efi_superusers = os_minor_version < 2 ? input('efi_superusers') : ['root']
  efi_superusers.push('root') if !efi_superusers.include?('root')
  efi_main_cfg = "/boot/efi/EFI/#{os().name}/grub.cfg"

  unless file('/sys/firmware/efi').exist?
    impact 0.0
    describe "System running BIOS" do
      skip "The System is running BIOS, this control is Not Applicable."
    end
  else
    if os[:release] < "7.2"
      impact 0.0
      describe "System running version of RHEL prior to 7.2" do
        skip "The System is running an outdated version of RHEL, this control is Not Applicable."
      end
    else
      impact 0.7
      efi_superusers.each do |user|
        describe file(efi_main_cfg) do
            its('content') { should match %r{^\s*password_pbkdf2\s+#{user} } }
        end
      end
    end
  end
end

