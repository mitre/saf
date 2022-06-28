# -*- encoding : utf-8 -*-
control "V-81011" do
  title "The Red Hat Enterprise Linux operating system must mount /dev/shm with
the nosuid option."
  desc  "The \"nosuid\" mount option causes the system to not execute
\"setuid\" and \"setgid\" files with owner privileges. This option must be used
for mounting any file system not containing approved \"setuid\" and \"setguid\"
files. Executing files from untrusted file systems increases the opportunity
for unprivileged users to attain unauthorized administrative access."
  desc  "rationale", ""
  desc  "check", "
    Verify that the \"nosuid\" option is configured for /dev/shm:

    # cat /etc/fstab | grep /dev/shm

    tmpfs /dev/shm tmpfs defaults,nodev,nosuid,noexec 0 0

    If any results are returned and the \"nosuid\" option is not listed, this
is a finding.

    Verify \"/dev/shm\" is mounted with the \"nosuid\" option:

    # mount | grep \"/dev/shm\" | grep nosuid

    If no results are returned, this is a finding.
  "
  desc  "fix", "Configure the system so that /dev/shm is mounted with the
\"nosuid\" option."
  impact 0.3
  tag severity: nil
  tag gtitle: "SRG-OS-000368-GPOS-00154"
  tag gid: "V-81011"
  tag rid: "SV-95723r2_rule"
  tag stig_id: "RHEL-07-021023"
  tag fix_id: "F-87845r2_fix"
  tag cci: ["CCI-001764"]
  tag nist: ["CM-7 (2)"]

  describe mount('/dev/shm') do
    its('options') { should include 'nosuid' }
  end
end

