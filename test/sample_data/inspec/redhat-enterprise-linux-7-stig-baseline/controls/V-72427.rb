# -*- encoding : utf-8 -*-
control "V-72427" do
  title "The Red Hat Enterprise Linux operating system must implement
  multifactor authentication for access to privileged accounts via pluggable
  authentication modules (PAM)."
  desc  "Using an authentication device, such as a CAC or token that is
  separate from the information system, ensures that even if the information
  system is compromised, that compromise will not affect credentials stored on
  the authentication device.

      Multifactor solutions that require devices separate from information
  systems gaining access include, for example, hardware tokens providing
  time-based or challenge-response authenticators and smart cards such as the
  U.S. Government Personal Identity Verification card and the DoD Common Access
  Card.

      A privileged account is defined as an information system account with
  authorizations of a privileged user.

      Remote access is access to DoD nonpublic information systems by an
  authorized user (or an information system) communicating through an external,
  non-organization-controlled network. Remote access methods include, for
  example, dial-up, broadband, and wireless.

      This requirement only applies to components where this is specific to the
  function of the device or has the concept of an organizational user (e.g., VPN,
  proxy capability). This does not apply to authentication for the purpose of
  configuring the device itself (management).


  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system implements multifactor authentication for
    remote access to privileged accounts via pluggable authentication modules (PAM).

        Check the \"/etc/sssd/sssd.conf\" file for the authentication services that
    are being used with the following command:

        # grep services /etc/sssd/sssd.conf /etc/sssd/conf.d/*.conf

        services = nss, pam

        If the \"pam\" service is not present on all \"services\" lines, this is a
    finding.
  "
  desc  "fix", "
    Configure the operating system to implement multifactor authentication for
    remote access to privileged accounts via pluggable authentication modules (PAM).

        Modify all of the services lines in \"/etc/sssd/sssd.conf\" or in
    configuration files found under \"/etc/sssd/conf.d\" to include pam."

  impact 0.5  
  tag severity: nil
  tag gtitle: "SRG-OS-000375-GPOS-00160"
  tag satisfies: ["SRG-OS-000375-GPOS-00160", "SRG-OS-000375-GPOS-00161",
"SRG-OS-000375-GPOS-00162"]
  tag gid: "V-72427"
  tag rid: "SV-87051r4_rule"
  tag stig_id: "RHEL-07-041002"
  tag fix_id: "F-78779r3_fix"
  tag cci: ["CCI-001948", "CCI-001953", "CCI-001954"]
  tag nist: ["IA-2 (11)", "IA-2 (12)", "IA-2 (12)"]

  unless package('sssd').installed?
    impact 0.0
    describe "The SSSD Package is not installed on the system" do
      skip "This control is Not Appliciable without the SSSD Package installed."
    end
  else
    if (!(sssd_files = command("find /etc/sssd -name *.conf").stdout.split("\n")).empty?)
      sssd_files.each do |file|
        describe.one do
          describe parse_config_file(file) do
            its('services') { should include 'pam' }
          end if package('sssd').installed?
          describe command("grep -i -E 'services(\s)*=(\s)*(.+*)pam' #{file}") do
            its('stdout.strip') { should include 'pam' }
          end if package('sssd').installed?
        end if package('sssd').installed?
      end
    else
      describe "The set of SSSD configuration files" do
          subject { sssd_files.to_a }
          it { should_not be_empty }
      end
    end
  end
end
