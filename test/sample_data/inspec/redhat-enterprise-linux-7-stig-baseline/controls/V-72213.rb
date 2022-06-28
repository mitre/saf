# -*- encoding : utf-8 -*-
control "V-72213" do
  title "The Red Hat Enterprise Linux operating system must use a virus scan
program."
  desc  "Virus scanning software can be used to protect a system from
penetration from computer viruses and to limit their spread through
intermediate systems.

    The virus scanning software should be configured to perform scans
dynamically on accessed files. If this capability is not available, the system
must be configured to scan, at a minimum, all altered files on the system on a
daily basis.

    If the system processes inbound SMTP mail, the virus scanner must be
configured to scan all received mail.
  "
  desc  "rationale", ""
  desc  "check", "
    Verify an anti-virus solution is installed on the system. The anti-virus
solution may be bundled with an approved host-based security solution.

    If there is no anti-virus solution installed on the system, this is a
finding.
  "
  desc  "fix", "Install an antivirus solution on the system."
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72213"
  tag rid: "SV-86837r3_rule"
  tag stig_id: "RHEL-07-032000"
  tag fix_id: "F-78567r2_fix"
  tag cci: ["CCI-001668"]
  tag nist: ["SI-3 a"]

  custom_antivirus = input('custom_antivirus')

  if ! custom_antivirus
    describe.one do
      describe service('nails') do
        it { should be_running }
      end
      describe service('clamav-daemon.socket') do
        it { should be_running }
      end
      describe service('ds_agent') do
        it { should be_running }
      end
    end
  else
    # Allow user to provide a description of their AV solution
    # for documentation.
    custom_antivirus_description = input('custom_antivirus_description')
    describe "Antivirus: #{custom_antivirus_description}" do
      subject { custom_antivirus_description }
      it { should_not cmp 'None' }
    end
  end
end

