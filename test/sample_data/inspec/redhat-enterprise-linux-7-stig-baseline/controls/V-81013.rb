# -*- encoding : utf-8 -*-
control "V-81013" do
  title "The Red Hat Enterprise Linux operating system must mount /dev/shm with
the noexec option."
  desc  "The \"noexec\" mount option causes the system to not execute binary
files. This option must be used for mounting any file system not containing
approved binary files as they may be incompatible. Executing files from
untrusted file systems increases the opportunity for unprivileged users to
attain unauthorized administrative access."
  desc  "rationale", ""
  desc  "check", "
    Verify that the \"noexec\" option is configured for /dev/shm:

    # cat /etc/fstab | grep /dev/shm

    tmpfs /dev/shm tmpfs defaults,nodev,nosuid,noexec 0 0

    If any results are returned and the \"noexec\" option is not listed, this
is a finding.

    Verify \"/dev/shm\" is mounted with the \"noexec\" option:

    # mount | grep \"/dev/shm\" | grep noexec

    If no results are returned, this is a finding.
  "
  desc  "fix", "Configure the system so that /dev/shm is mounted with the
\"noexec\" option."
  impact 0.3
  tag severity: nil
  tag gtitle: "SRG-OS-000368-GPOS-00154"
  tag gid: "V-81013"
  tag rid: "SV-95725r2_rule"
  tag stig_id: "RHEL-07-021024"
  tag fix_id: "F-87847r2_fix"
  tag cci: ["CCI-001764"]
  tag nist: ["CM-7 (2)"]

  describe mount('/dev/shm') do
    its('options') { should include 'noexec' }
  end
end

