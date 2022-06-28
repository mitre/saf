# -*- encoding : utf-8 -*-
control "V-71965" do
  title "The Red Hat Enterprise Linux operating system must uniquely identify
and must authenticate organizational users (or processes acting on behalf of
organizational users) using multifactor authentication."
  desc  "To assure accountability and prevent unauthenticated access,
organizational users must be identified and authenticated to prevent potential
misuse and compromise of the system.

    Organizational users include organizational employees or individuals the
organization deems to have equivalent status of employees (e.g., contractors).
Organizational users (and processes acting on behalf of users) must be uniquely
identified and authenticated to all accesses, except for the following:

    1) Accesses explicitly identified and documented by the organization.
Organizations document specific user actions that can be performed on the
information system without identification or authentication;

    and

    2) Accesses that occur through authorized use of group authenticators
without individual authentication. Organizations may require unique
identification of individuals in group accounts (e.g., shared privilege
accounts) or for detailed accountability of individual activity.


  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system requires multifactor authentication to uniquely
identify organizational users using multifactor authentication.

    Check to see if smartcard authentication is enforced on the system:

    # authconfig --test | grep \"pam_pkcs11 is enabled\"

    If no results are returned, this is a finding.

    # authconfig --test | grep \"smartcard removal action\"

    If \"smartcard removal action\" is blank, this is a finding.

    # authconfig --test | grep \"smartcard module\"

    If \"smartcard module\" is blank, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to require individuals to be authenticated
with a multifactor authenticator.

    Enable smartcard logons with the following commands:

    # authconfig --enablesmartcard --smartcardaction=0 --update
    # authconfig --enablerequiresmartcard -update

    Modify the \"/etc/pam_pkcs11/pkcs11_eventmgr.conf\" file to uncomment the
following line:

    #/usr/X11R6/bin/xscreensaver-command -lock

    Modify the \"/etc/pam_pkcs11/pam_pkcs11.conf\" file to use the cackey
module if required.
  "
  tag severity: nil
  tag gtitle: "SRG-OS-000104-GPOS-00051"
  tag satisfies: ["SRG-OS-000104-GPOS-00051", "SRG-OS-000106-GPOS-00053",
"SRG-OS-000107-GPOS-00054", "SRG-OS-000109-GPOS-00056",
"SRG-OS-000108-GPOS-00055", "SRG-OS-000108-GPOS-00057",
"SRG-OS-000108-GPOS-00058"]
  tag gid: "V-71965"
  tag rid: "SV-86589r2_rule"
  tag stig_id: "RHEL-07-010500"
  tag fix_id: "F-78317r3_fix"
  tag cci: ["CCI-000766"]
  tag nist: ["IA-2 (2)"]

  smart_card_status = input('smart_card_status')
  if smart_card_status.eql?('enabled')
    impact 0.5
    describe command("authconfig --test | grep -i smartcard") do
      its('stdout') { should match %r{use\sonly\ssmartcard\sfor\slogin\sis\s#{smart_card_status}} }
      its('stdout') { should match %r{smartcard\smodule\s=\s".+"} }
      its('stdout') { should match %r{smartcard\sremoval\saction\s=\s".+"} }
    end
  else
    impact 0.0
    describe "The system is not smartcard enabled" do
      skip "The system is not using Smartcards / PIVs to fulfil the MFA requirement, this control is Not Applicable."
    end
  end
end

