# -*- encoding : utf-8 -*-
control "V-72225" do
  title "The Red Hat Enterprise Linux operating system must display the
Standard Mandatory DoD Notice and Consent Banner immediately prior to, or as
part of, remote access logon prompts."
  desc  "Display of a standardized and approved use notification before
granting access to the publicly accessible operating system ensures privacy and
security notification verbiage used is consistent with applicable federal laws,
Executive Orders, directives, policies, regulations, standards, and guidance.

    System use notifications are required only for access via logon interfaces
with human users and are not required when such human interfaces do not exist.

    The banner must be formatted in accordance with applicable DoD policy. Use
the following verbiage for operating systems that can accommodate banners of
1300 characters:

    \"You are accessing a U.S. Government (USG) Information System (IS) that is
provided for USG-authorized use only.

    By using this IS (which includes any device attached to this IS), you
consent to the following conditions:

    -The USG routinely intercepts and monitors communications on this IS for
purposes including, but not limited to, penetration testing, COMSEC monitoring,
network operations and defense, personnel misconduct (PM), law enforcement
(LE), and counterintelligence (CI) investigations.

    -At any time, the USG may inspect and seize data stored on this IS.

    -Communications using, or data stored on, this IS are not private, are
subject to routine monitoring, interception, and search, and may be disclosed
or used for any USG-authorized purpose.

    -This IS includes security measures (e.g., authentication and access
controls) to protect USG interests--not for your personal benefit or privacy.

    -Notwithstanding the above, using this IS does not constitute consent to
PM, LE or CI investigative searching or monitoring of the content of privileged
communications, or work product, related to personal representation or services
by attorneys, psychotherapists, or clergy, and their assistants. Such
communications and work product are private and confidential. See User
Agreement for details.\"


  "
  desc  "rationale", ""
  desc  "check", "
    Verify any publicly accessible connection to the operating system displays
the Standard Mandatory DoD Notice and Consent Banner before granting access to
the system.

    Check for the location of the banner file being used with the following
command:

    # grep -i banner /etc/ssh/sshd_config

    banner /etc/issue

    This command will return the banner keyword and the name of the file that
contains the ssh banner (in this case \"/etc/issue\").

    If the line is commented out, this is a finding.

    View the file specified by the banner keyword to check that it matches the
text of the Standard Mandatory DoD Notice and Consent Banner:

    \"You are accessing a U.S. Government (USG) Information System (IS) that is
provided for USG-authorized use only. By using this IS (which includes any
device attached to this IS), you consent to the following conditions:

    -The USG routinely intercepts and monitors communications on this IS for
purposes including, but not limited to, penetration testing, COMSEC monitoring,
network operations and defense, personnel misconduct (PM), law enforcement
(LE), and counterintelligence (CI) investigations.

    -At any time, the USG may inspect and seize data stored on this IS.

    -Communications using, or data stored on, this IS are not private, are
subject to routine monitoring, interception, and search, and may be disclosed
or used for any USG-authorized purpose.

    -This IS includes security measures (e.g., authentication and access
controls) to protect USG interests--not for your personal benefit or privacy.

    -Notwithstanding the above, using this IS does not constitute consent to
PM, LE or CI investigative searching or monitoring of the content of privileged
communications, or work product, related to personal representation or services
by attorneys, psychotherapists, or clergy, and their assistants. Such
communications and work product are private and confidential. See User
Agreement for details.\"

    If the system does not display a graphical logon banner or the banner does
not match the Standard Mandatory DoD Notice and Consent Banner, this is a
finding.

    If the text in the file does not match the Standard Mandatory DoD Notice
and Consent Banner, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to display the Standard Mandatory DoD Notice
and Consent Banner before granting access to the system via the ssh.

    Edit the \"/etc/ssh/sshd_config\" file to uncomment the banner keyword and
configure it to point to a file that will contain the logon banner (this file
may be named differently or be in a different location if using a version of
SSH that is provided by a third-party vendor). An example configuration line is:

    banner /etc/issue

    Either create the file containing the banner or replace the text in the
file with the Standard Mandatory DoD Notice and Consent Banner. The DoD
required text is:

    \"You are accessing a U.S. Government (USG) Information System (IS) that is
provided for USG-authorized use only. By using this IS (which includes any
device attached to this IS), you consent to the following conditions:

    -The USG routinely intercepts and monitors communications on this IS for
purposes including, but not limited to, penetration testing, COMSEC monitoring,
network operations and defense, personnel misconduct (PM), law enforcement
(LE), and counterintelligence (CI) investigations.

    -At any time, the USG may inspect and seize data stored on this IS.

    -Communications using, or data stored on, this IS are not private, are
subject to routine monitoring, interception, and search, and may be disclosed
or used for any USG-authorized purpose.

    -This IS includes security measures (e.g., authentication and access
controls) to protect USG interests--not for your personal benefit or privacy.

    -Notwithstanding the above, using this IS does not constitute consent to
PM, LE or CI investigative searching or monitoring of the content of privileged
communications, or work product, related to personal representation or services
by attorneys, psychotherapists, or clergy, and their assistants. Such
communications and work product are private and confidential. See User
Agreement for details.\"

    The SSH service must be restarted for changes to take effect.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000023-GPOS-00006"
  tag satisfies: ["SRG-OS-000023-GPOS-00006", "SRG-OS-000024-GPOS-00007",
"SRG-OS-000228-GPOS-00088"]
  tag gid: "V-72225"
  tag rid: "SV-86849r4_rule"
  tag stig_id: "RHEL-07-040170"
  tag fix_id: "F-78579r4_fix"
  tag cci: ["CCI-000048", "CCI-000050", "CCI-001384", "CCI-001385",
"CCI-001386", "CCI-001387", "CCI-001388"]
  tag nist: ["AC-8 a", "AC-8 b", "AC-8 c 1", "AC-8 c 2", "AC-8 c 2", "AC-8 c
2", "AC-8 c 3"]

  banner_message_text_ral = input('banner_message_text_ral')
  banner_message_text_ral_limited = input('banner_message_text_ral_limited')

  #When Banner is commented, not found, disabled, or the specified file does not exist, this is a finding.
  banner_files = [sshd_config.banner].flatten

  banner_files.each do |banner_file|

    #Banner property is commented out.
    describe "The SSHD Banner is not set" do
      subject { banner_file.nil? }
      it { should be false }
    end if banner_file.nil?

    #Banner property is set to "none"
    describe "The SSHD Banner is disabled" do
      subject { banner_file.match(/none/i).nil? }
      it { should be true }
    end if !banner_file.nil? && !banner_file.match(/none/i).nil?

    #Banner property provides a path to a file, however, it does not exist.
    describe "The SSHD Banner is set, but, the file does not exist" do
      subject { file(banner_file).exist? }
      it { should be true }
    end if !banner_file.nil? && banner_file.match(/none/i).nil? && !file(banner_file).exist?

    #Banner property provides a path to a file and it exists.
    describe.one do
      banner = file(banner_file).content.gsub(%r{[\r\n\s]}, '')
      clean_banner = banner_message_text_ral.gsub(%r{[\r\n\s]}, '')
      clean_banner_limited = banner_message_text_ral_limited.gsub(%r{[\r\n\s]}, '')

      describe "The SSHD Banner is set to the standard banner and has the correct text" do
        subject { banner }
        it { should cmp clean_banner }
      end

      describe "The SSHD Banner is set to the standard limited banner and has the correct text" do
        subject { banner }
        it { should cmp clean_banner_limited }
      end
    end if !banner_file.nil? && banner_file.match(/none/i).nil? && file(banner_file).exist?
  end
end

