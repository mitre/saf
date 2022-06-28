# -*- encoding : utf-8 -*-
control "V-71855" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that the cryptographic hash of system files and commands matches vendor values."
  desc  "Without cryptographic integrity protections, system command and files
can be altered by unauthorized users without detection.

    Cryptographic mechanisms used for protecting the integrity of information
include, for example, signed hash functions using asymmetric cryptography
enabling distribution of the public key to verify the hash information while
maintaining the confidentiality of the key used to generate the hash.
  "
  desc  "rationale", ""
  desc  "check", "
    Verify the cryptographic hash of system files and commands match the vendor
values.

    Check the cryptographic hash of system files and commands with the
following command:

    Note: System configuration files (indicated by a \"c\" in the second
column) are expected to change over time. Unusual modifications should be
investigated through the system audit log.

    # rpm -Va --noconfig | grep '^..5'

    If there is any output from the command for system files or binaries, this
is a finding.
  "
  desc  "fix", "
    Run the following command to determine which package owns the file:

    # rpm -qf <filename>

    The package can be reinstalled from a yum repository using the command:

    # sudo yum reinstall <packagename>

    Alternatively, the package can be reinstalled from trusted media using the
command:

    # sudo rpm -Uvh <packagename>
  "
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-71855"
  tag rid: "SV-86479r4_rule"
  tag stig_id: "RHEL-07-010020"
  tag fix_id: "F-78207r1_fix"
  tag cci: ["CCI-001749"]
  tag nist: ["CM-5 (3)"]

rpm_verify_integrity_except = input('rpm_verify_integrity_except')

if input('disable_slow_controls')
    describe "This control consistently takes a long to run and has been disabled
    using the disable_slow_controls attribute." do
      skip "This control consistently takes a long to run and has been disabled
      using the disable_slow_controls attribute. You must enable this control for a
      full accredidation for production."
    end
  else
    # grep excludes files that are marked with 'c' attribute (config files)
    describe command("rpm -Va | grep '^..5' | grep -E -v '[a-z]*c[a-z]*\\s+\\S+$' | awk 'NF>1{print $NF}'").
      stdout.strip.split("\n") do
        it { should all(be_in rpm_verify_integrity_except) }
      end
  end
end


