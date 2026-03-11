# encoding: UTF-8

control "V-93473" do
  title "Windows Server 2019 passwords for the built-in Administrator account must be changed at least every 60 days."
  desc  "The longer a password is in use, the greater the opportunity for someone to gain unauthorized knowledge of the password. The built-in Administrator account is not generally used and its password not may be changed as frequently as necessary. Changing the password for the built-in Administrator account on a regular basis will limit its exposure.
    Organizations that use an automated tool, such Microsoft's Local Administrator Password Solution (LAPS), on domain-joined systems can configure this to occur more frequently. LAPS will change the password every \"30\" days by default."
  desc  "rationale", ""
  desc  "check", "Review the password last set date for the built-in Administrator account.

    Domain controllers:
    Open \"PowerShell\".
    Enter \"Get-ADUser -Filter * -Properties SID, PasswordLastSet | Where SID -Like \"*-500\" | Ft Name, SID, PasswordLastSet\".
    If the \"PasswordLastSet\" date is greater than \"60\" days old, this is a finding.

    Member servers and standalone systems:
    Open \"Command Prompt\".
    Enter 'Net User [account name] | Find /i \"Password Last Set\"', where [account name] is the name of the built-in administrator account.
    (The name of the built-in Administrator account must be changed to something other than \"Administrator\" per STIG requirements.)
    If the \"PasswordLastSet\" date is greater than \"60\" days old, this is a finding."
  desc  "fix", "Change the built-in Administrator account password at least every \"60\" days.
    Automated tools, such as Microsoft's LAPS, may be used on domain-joined member servers to accomplish this."
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000076-GPOS-00044"
  tag gid: "V-93473"
  tag rid: "SV-103559r1_rule"
  tag stig_id: "WN19-00-000020"
  tag fix_id: "F-99717r1_fix"
  tag cci: ["CCI-000199"]
  tag nist: ["IA-5 (1) (d)", "Rev_4"]

  administrator = input('local_administrator')
  domain_role = command('wmic computersystem get domainrole | Findstr /v DomainRole').stdout.strip

  if domain_role == '4' || domain_role == '5'
    password_set_date = json({ command: "Get-ADUser -Filter * -Properties SID, PasswordLastSet | Where-Object {$_.SID -like '*-500' -and $_.PasswordLastSet -lt ((Get-Date).AddDays(-60))} | Select-Object -ExpandProperty PasswordLastSet | ConvertTo-Json" })
    date = password_set_date["DateTime"]
    describe "Password Last Set Date" do
      it "The built-in Administrator account must be changed at least every 60 days." do
        expect(date).to be_nil
      end
    end
  else
    if administrator == "Administrator"
      describe 'The name of the built-in Administrator account:' do
        it 'It must be changed to something other than "Administrator" per STIG requirements' do
          failure_message = "Change the built-in Administrator account name to something other than: #{administrator}"
          expect(administrator).not_to eq("Administrator"), failure_message
        end
      end
    end
    local_password_set_date = json({ command: "Get-LocalUser -name #{administrator} | Where-Object {$_.PasswordLastSet -le (Get-Date).AddDays(-60)} | Select-Object -ExpandProperty PasswordLastSet | ConvertTo-Json"})
    local_date =  local_password_set_date["DateTime"]
    describe "Password Last Set Date" do
      it "The built-in Administrator account must be changed at least every 60 days." do
        expect(local_date).to be_nil
      end
    end
  end
end