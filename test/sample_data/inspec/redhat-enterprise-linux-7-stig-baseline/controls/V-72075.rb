# -*- encoding : utf-8 -*-
control "V-72075" do
  title "The Red Hat Enterprise Linux operating system must not allow removable
media to be used as the boot loader unless approved."
  desc  "Malicious users with removable boot media can gain access to a system
configured to use removable media as the boot loader. If removable media is
designed to be used as the boot loader, the requirement must be documented with
the Information System Security Officer (ISSO)."
  desc  "rationale", ""
  desc  "check", "
    Verify the system is not configured to use a boot loader on removable media.

    Note: GRUB 2 reads its configuration from the \"/boot/grub2/grub.cfg\" file
on traditional BIOS-based machines and from the
\"/boot/efi/EFI/redhat/grub.cfg\" file on UEFI machines.

    Check for the existence of alternate boot loader configuration files with
the following command:

    # find / -name grub.cfg
    /boot/grub2/grub.cfg

    If a \"grub.cfg\" is found in any subdirectories other than \"/boot/grub2\"
and \"/boot/efi/EFI/redhat\", ask the System Administrator if there is
documentation signed by the ISSO to approve the use of removable media as a
boot loader.

    Check that the grub configuration file has the set root command in each
menu entry with the following commands:

    # grep -c menuentry /boot/grub2/grub.cfg
    1
    # grep 'set root' /boot/grub2/grub.cfg
    set root=(hd0,1)

    If the system is using an alternate boot loader on removable media, and
documentation does not exist approving the alternate configuration, this is a
finding.
  "
  desc  "fix", "Remove alternate methods of booting the system from removable
media or document the configuration to boot from removable media with the ISSO."
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000364-GPOS-00151"
  tag gid: "V-72075"
  tag rid: "SV-86699r2_rule"
  tag stig_id: "RHEL-07-021700"
  tag fix_id: "F-78427r1_fix"
  tag cci: ["CCI-000318", "CCI-000368", "CCI-001812", "CCI-001813",
"CCI-001814"]
  tag nist: ["CM-3 f", "CM-6 c", "CM-11 (2)", "CM-5 (1)", "CM-5 (1)"]

  roots = command('grubby --info=ALL | grep "^root=" | sed "s/^root=//g"').
    stdout.strip.split("\n")

  blocks = roots.map { |root|
    root_file = file(root)
    root_file.symlink? ? root_file.link_path : root_file.path
  }

  blocks.each { |block|
    block_file = file(block)
    describe block_file do
      it { should exist }
      its('path') { should match %r{^/dev/} }
    end

    if block_file.exist? and block_file.path.match? %r{^/dev/}
      removable = ['/sys/block', block.sub(%r{^/dev/}, ''), 'removable'].join('/')
      describe file(removable) do
        it { should exist }
        its('content.strip') { should eq '0' }
      end
    end
  }
end

