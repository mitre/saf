# -*- encoding : utf-8 -*-
control "V-72073" do
  title "The Red Hat Enterprise Linux operating system must use a file
integrity tool that is configured to use FIPS 140-2 approved cryptographic
hashes for validating file contents and directories."
  desc  "File integrity tools use cryptographic hashes for verifying file
contents and directories have not been altered. These hashes must be FIPS 140-2
approved cryptographic hashes."
  desc  "rationale", ""
  desc  "check", "
    Verify the file integrity tool is configured to use FIPS 140-2 approved
cryptographic hashes for validating file contents and directories.

    Note: If RHEL-07-021350 is a finding, this is automatically a finding too
as the system cannot implement FIPS 140-2 approved cryptographic algorithms and
hashes.

    Check to see if Advanced Intrusion Detection Environment (AIDE) is
installed on the system with the following command:

    # yum list installed aide

    If AIDE is not installed, ask the System Administrator how file integrity
checks are performed on the system.

    If there is no application installed to perform file integrity checks, this
is a finding.

    Note: AIDE is highly configurable at install time. These commands assume
the \"aide.conf\" file is under the \"/etc\" directory.

    Use the following command to determine if the file is in another location:

    # find / -name aide.conf

    Check the \"aide.conf\" file to determine if the \"sha512\" rule has been
added to the rule list being applied to the files and directories selection
lists.

    An example rule that includes the \"sha512\" rule follows:

    All=p+i+n+u+g+s+m+S+sha512+acl+xattrs+selinux
    /bin All # apply the custom rule to the files in bin
    /sbin All # apply the same custom rule to the files in sbin

    If the \"sha512\" rule is not being used on all uncommented selection lines
in the \"/etc/aide.conf\" file, or another file integrity tool is not using
FIPS 140-2 approved cryptographic hashes for validating file contents and
directories, this is a finding.
  "
  desc  "fix", "
    Configure the file integrity tool to use FIPS 140-2 cryptographic hashes
for validating file and directory contents.

    If AIDE is installed, ensure the \"sha512\" rule is present on all
uncommented file and directory selection lists.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72073"
  tag rid: "SV-86697r3_rule"
  tag stig_id: "RHEL-07-021620"
  tag fix_id: "F-78425r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  describe package("aide") do
    it { should be_installed }
  end

  exclude_patterns = input('aide_exclude_patterns')

  findings = aide_conf.where { !selection_line.start_with?('!') && !exclude_patterns.include?(selection_line) && !rules.include?('sha512')}

  describe "List of monitored files/directories without 'sha512' rule" do
    subject { findings.selection_lines }
    it { should be_empty }
  end
end

