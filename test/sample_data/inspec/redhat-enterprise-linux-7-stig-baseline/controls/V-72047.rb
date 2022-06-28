# -*- encoding : utf-8 -*-
control "V-72047" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that all world-writable directories are group-owned by root, sys, bin, or an
application group."
  desc  "If a world-writable directory has the sticky bit set and is not
group-owned by a privileged Group Identifier (GID), unauthorized users may be
able to modify files created by others.

    The only authorized public directories are those temporary directories
supplied with the system or those designed to be temporary file repositories.
The setting is normally reserved for directories used by the system and by
users for temporary file storage, (e.g., /tmp), and for directories requiring
global read/write access.
  "
  desc  "rationale", ""
  desc  "check", "
    Verify all world-writable directories are group-owned by root, sys, bin, or
an application group.

    Check the system for world-writable directories with the following command:

    Note: The value after -fstype must be replaced with the filesystem type.
XFS is used as an example.

    # find / -xdev -perm -002 -type d -fstype xfs -exec ls -lLd {} \\;
    drwxrwxrwt 2 root root 40 Aug 26 13:07 /dev/mqueue
    drwxrwxrwt 2 root root 220 Aug 26 13:23 /dev/shm
    drwxrwxrwt 14 root root 4096 Aug 26 13:29 /tmp

    If any world-writable directories are not owned by root, sys, bin, or an
application group associated with the directory, this is a finding.
  "
  desc  "fix", "
    Change the group of the world-writable directories to root with the
following command:

    # chgrp root <directory>
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72047"
  tag rid: "SV-86671r4_rule"
  tag stig_id: "RHEL-07-021030"
  tag fix_id: "F-78399r1_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  application_groups = input('application_groups')

  ww_dirs = Set[]
  partitions = etc_fstab.params.map{|partition| partition['file_system_type']}.uniq
  partitions.each do |part|
    cmd = "find / -perm -002 -xdev -type d -fstype #{part} -exec ls -lLd {} \\;"
    ww_dirs = ww_dirs + command(cmd).stdout.split("\n")
  end

  ww_dirs.to_a.each do |curr_dir|
    dir_arr = curr_dir.split(' ')
    describe file(dir_arr.last) do
      its('group') { should be_in ["root","sys","bin"] + application_groups }
    end
  end
end

