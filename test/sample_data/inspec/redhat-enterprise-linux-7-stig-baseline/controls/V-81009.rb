# -*- encoding : utf-8 -*-
control "V-81009" do
  title "The Red Hat Enterprise Linux operating system must mount /dev/shm with
the nodev option."
  desc  "The \"nodev\" mount option causes the system to not interpret
character or block special devices. Executing character or block special
devices from untrusted file systems increases the opportunity for unprivileged
users to attain unauthorized administrative access."
  desc  "rationale", ""
  desc  "check", "
    Verify that the \"nodev\" option is configured for /dev/shm:


    # cat /etc/fstab | grep /dev/shm
    tmpfs /dev/shm tmpfs defaults,nodev,nosuid,noexec 0 0

    If any results are returned and the \"nodev\" option is not listed, this is
a finding.

    Verify \"/dev/shm\" is mounted with the \"nodev\" option:

    # mount | grep \"/dev/shm\" | grep nodev

    If no results are returned, this is a finding.
  "
  desc  "fix", "Configure the system so that /dev/shm is mounted with the
\"nodev\" option."
  impact 0.3
  tag severity: nil
  tag gtitle: "SRG-OS-000368-GPOS-00154"
  tag gid: "V-81009"
  tag rid: "SV-95721r2_rule"
  tag stig_id: "RHEL-07-021022"
  tag fix_id: "F-87843r2_fix"
  tag cci: ["CCI-001764"]
  tag nist: ["CM-7 (2)"]

  describe mount('/dev/shm') do
    its('options') { should include 'nodev' }
  end
end

