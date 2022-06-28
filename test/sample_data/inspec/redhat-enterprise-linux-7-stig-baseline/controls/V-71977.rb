# -*- encoding : utf-8 -*-
control "V-71977" do
  title "The Red Hat Enterprise Linux operating system must prevent the
installation of software, patches, service packs, device drivers, or operating
system components from a repository without verification they have been
digitally signed using a certificate that is issued by a Certificate Authority
(CA) that is recognized and approved by the organization."
  desc  "Changes to any software components can have significant effects on the
overall security of the operating system. This requirement ensures the software
has not been tampered with and that it has been provided by a trusted vendor.

    Accordingly, patches, service packs, device drivers, or operating system
components must be signed with a certificate recognized and approved by the
organization.

    Verifying the authenticity of the software prior to installation validates
the integrity of the patch or upgrade received from a vendor. This verifies the
software has not been tampered with and that it has been provided by a trusted
vendor. Self-signed certificates are disallowed by this requirement. The
operating system should not have to verify the software again. This requirement
does not mandate DoD certificates for this purpose; however, the certificate
used to verify the software must be from an approved CA.
  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system prevents the installation of patches, service
packs, device drivers, or operating system components from a repository without
verification that they have been digitally signed using a certificate that is
recognized and approved by the organization.

    Check that yum verifies the signature of packages from a repository prior
to install with the following command:

    # grep gpgcheck /etc/yum.conf
    gpgcheck=1

    If \"gpgcheck\" is not set to \"1\", or if options are missing or commented
out, ask the System Administrator how the certificates for patches and other
operating system components are verified.

    If there is no process to validate certificates that is approved by the
organization, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to verify the signature of packages from a
repository prior to install by setting the following option in the
\"/etc/yum.conf\" file:

    gpgcheck=1
  "
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000366-GPOS-00153"
  tag gid: "V-71977"
  tag rid: "SV-86601r2_rule"
  tag stig_id: "RHEL-07-020050"
  tag fix_id: "F-78329r1_fix"
  tag cci: ["CCI-001749"]
  tag nist: ["CM-5 (3)"]

  yum_conf = '/etc/yum.conf'

  if ((f = file(yum_conf)).exist?)
    describe ini(yum_conf) do
      its('main.gpgcheck') { should cmp 1 }
    end
  else
    describe f do
      it { should exist }
    end
  end
end

