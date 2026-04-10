# encoding: UTF-8

control "V-93369" do
  title "Windows Server 2019 users with Administrative privileges must have separate accounts for administrative duties and normal operational tasks."
  desc  "Using a privileged account to perform routine functions makes the computer vulnerable to malicious software inadvertently introduced during a session that has been granted full privileges."
  desc  "rationale", ""
  desc  "check", "Verify each user with administrative privileges has been assigned a unique administrative account separate from their standard user account.
    If users with administrative privileges do not have separate accounts for administrative functions and standard user functions, this is a finding."
  desc  "fix", "Ensure each user with administrative privileges has a separate account for user duties and one for privileged duties."
  impact 0.7
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-93369"
  tag rid: "SV-103457r1_rule"
  tag stig_id: "WN19-00-000010"
  tag fix_id: "F-99615r1_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b", "Rev_4"]

  administrators = input('administrators')
  administrator_group = command("net localgroup Administrators | Format-List | Findstr /V 'Alias Name Comment Members - command'").stdout.strip.split("\r\n")
  administrator_group.each do |user|
    describe user.to_s do
      it { should be_in administrators }
    end
  end
  if administrator_group.empty?
    impact 0.0
    describe 'There are no users with administrative privileges' do
      skip 'There are no users with administrative privileges so this control is NA'
    end
  end
end