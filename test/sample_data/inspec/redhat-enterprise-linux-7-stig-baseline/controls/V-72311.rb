# -*- encoding : utf-8 -*-
control "V-72311" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that the Network File System (NFS) is configured to use RPCSEC_GSS."
  desc  "When an NFS server is configured to use RPCSEC_SYS, a selected userid
and groupid are used to handle requests from the remote user. The userid and
groupid could mistakenly or maliciously be set incorrectly. The RPCSEC_GSS
method of authentication uses certificates on the server and client systems to
more securely authenticate the remote mount request."
  desc  "rationale", ""
  desc  "check", "
    Verify \"AUTH_GSS\" is being used to authenticate NFS mounts.

    To check if the system is importing an NFS file system, look for any
entries in the \"/etc/fstab\" file that have a file system type of \"nfs\" with
the following command:

    # cat /etc/fstab | grep nfs
    192.168.21.5:/mnt/export /data1 nfs4 rw,sync ,soft,sec=krb5:krb5i:krb5p

    If the system is mounting file systems via NFS and has the sec option
without the \"krb5:krb5i:krb5p\" settings, the \"sec\" option has the \"sys\"
setting, or the \"sec\" option is missing, this is a finding.
  "
  desc  "fix", "
    Update the \"/etc/fstab\" file so the option \"sec\" is defined for each
NFS mounted file system and the \"sec\" option does not have the \"sys\"
setting.

    Ensure the \"sec\" option is defined as \"krb5:krb5i:krb5p\".
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72311"
  tag rid: "SV-86935r4_rule"
  tag stig_id: "RHEL-07-040750"
  tag fix_id: "F-78665r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  nfs_systems = etc_fstab.nfs_file_systems.entries
  if !nfs_systems.nil? and !nfs_systems.empty?
    nfs_systems.each do |file_system|
      describe file_system do
        its ('mount_options') { should include 'sec=krb5:krb5i:krb5p' }
      end
    end
  else
    describe "No NFS file systems were found." do
      subject { nfs_systems.nil? or nfs_systems.empty? }
      it { should eq true }
    end
  end
end

