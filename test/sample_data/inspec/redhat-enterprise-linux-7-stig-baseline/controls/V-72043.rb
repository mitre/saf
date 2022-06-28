# -*- encoding : utf-8 -*-
control "V-72043" do
  title "The Red Hat Enterprise Linux operating system must prevent files with
the setuid and setgid bit set from being executed on file systems that are used
with removable media."
  desc  "The \"nosuid\" mount option causes the system to not execute
\"setuid\" and \"setgid\" files with owner privileges. This option must be used
for mounting any file system not containing approved \"setuid\" and \"setguid\"
files. Executing files from untrusted file systems increases the opportunity
for unprivileged users to attain unauthorized administrative access."
  desc  "rationale", ""
  desc  "check", "
    Verify file systems that are used for removable media are mounted with the
\"nosuid\" option.

    Check the file systems that are mounted at boot time with the following
command:

    # more /etc/fstab

    UUID=2bc871e4-e2a3-4f29-9ece-3be60c835222 /mnt/usbflash vfat
noauto,owner,ro,nosuid 0 0

    If a file system found in \"/etc/fstab\" refers to removable media and it
does not have the \"nosuid\" option set, this is a finding.
  "
  desc  "fix", "Configure the \"/etc/fstab\" to use the \"nosuid\" option on
file systems that are associated with removable media."
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72043"
  tag rid: "SV-86667r2_rule"
  tag stig_id: "RHEL-07-021010"
  tag fix_id: "F-78395r1_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  non_removable_media_fs = input('non_removable_media_fs')

  file_systems = etc_fstab.params
  if !file_systems.nil? and !file_systems.empty?
    file_systems.each do |file_sys_line|
      if !"#{non_removable_media_fs}".include?(file_sys_line['file_system_type']) then
        describe file_sys_line['mount_options'] do
          it { should include 'nosuid' }
        end
      else
        describe "File system \"#{file_sys_line['file_system_type']}\" does not correspond to removable media." do
          subject { "#{non_removable_media_fs}".include?(file_sys_line['file_system_type']) }
          it { should eq true }
        end
      end
    end
  else
    describe "No file systems were found." do
      subject { file_systems.nil? }
      it { should eq true }
    end
  end
end

