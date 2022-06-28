# -*- encoding : utf-8 -*-
control "V-71961" do
  title "Red Hat Enterprise Linux operating systems prior to version 7.2 with a
Basic Input/Output System (BIOS) must require authentication upon booting into
single-user and maintenance modes."
  desc  "If the system does not require valid root authentication before it
boots into single-user or maintenance mode, anyone who invokes single-user or
maintenance mode is granted privileged access to all files on the system. GRUB
2 is the default boot loader for RHEL 7 and is designed to require a password
to boot into single-user mode or make modifications to the boot menu."
  desc  "rationale", ""
  desc  "check", "
    For systems that use UEFI, this is Not Applicable.
    For systems that are running RHEL 7.2 or newer, this is Not Applicable.

    Check to see if an encrypted root password is set. On systems that use a
BIOS, use the following command:

    # grep -i password_pbkdf2 /boot/grub2/grub.cfg

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
    # mv /tmp/grub2.cfg /boot/grub2/grub.cfg
  "
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000080-GPOS-00048"
  tag gid: "V-71961"
  tag rid: "SV-86585r6_rule"
  tag stig_id: "RHEL-07-010480"
  tag fix_id: "F-78313r3_fix"
  tag cci: ["CCI-000213"]
  tag nist: ["AC-3"]

  grub_superuser = input('grub_superuser')
  grub_user_boot_files = input('grub_user_boot_files')
  grub_main_cfg = input('grub_main_cfg')

  grub_main_content = file(grub_main_cfg).content

  if file('/sys/firmware/efi').exist?
    impact 0.0
    describe "System running UEFI" do
      skip "The System is running UEFI, this control is Not Applicable."
    end
  else
    if os[:release] >= "7.2"
      impact 0.0
      describe "System running version of RHEL that is equal to or newer than 7.2" do
        skip "The System is running version #{os[:release]} of RHEL, this control is Not Applicable."
      end
    else
      impact 0.7
      # Check if any additional superusers are set
      pattern = %r{\s*set superusers=\"(\w+)\"}i
      matches = grub_main_content.match(pattern)
      superusers = matches.nil? ? [] : matches.captures
      describe "There must be only one grub2 superuser, and it must have the value #{grub_superuser}" do
        subject { superusers }
        its('length') { should cmp 1 }
        its('first') { should cmp grub_superuser }
      end

      # Need each password entry that has the superuser
      pattern = %r{(.*)\s#{grub_superuser}\s}i
      matches = grub_main_content.match(pattern)
      password_entries = matches.nil? ? [] : matches.captures
      # Each of the entries should start with password_pbkdf2
      describe 'The grub2 superuser password entry must begin with \'password_pbkdf2\'' do
        subject { password_entries }
        its('length') { is_expected.to be >= 1}
        password_entries.each do |entry|
          subject { entry }
          it { should include 'password_pbkdf2'}
        end
      end

      # Get lines such as 'password_pbkdf2 root ${ENV}'
      pattern = %r{password_pbkdf2\s#{grub_superuser}\s(\${\w+})}i
      matches = grub_main_content.match(pattern)
      env_vars = matches.nil? ? [] : matches.captures
      if env_vars.length > 0
        # If there is an environment variable in the configuration file check that it is set with correct values by looking
        # in user.cfg files.
        env_vars = env_vars.map { |env_var| env_var.gsub(/[${}]/, '') }
        present_user_boot_files = grub_user_boot_files.select { |user_boot_file| file(user_boot_file).exist? }
        describe 'grub2 user configuration files for the superuser should be present if they set an environment variable' do
          subject { present_user_boot_files }
          its('length') { is_expected.to be >= 1 }
          present_user_boot_files.each do |user_boot_file|
            env_vars.each do |env_var|
              describe "#{user_boot_file} should set #{env_var} to a pbkdf2 value" do
                  subject { file(user_boot_file) }
                  its('content') { should match %r{^#{env_var}=grub.pbkdf2}i }
              end
            end
          end
        end
      else
        # If there are no environment variable set, look for pbkdf2 after the superuser name
        pattern = %r{password_pbkdf2\s#{grub_superuser}\sgrub\.pbkdf2}i
        describe 'The grub2 superuser account password should be encrypted with pbkdf2.' do
          subject { grub_main_content }
          it { should match pattern }
        end
      end
    end
  end
end


