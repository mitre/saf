# encoding: UTF-8

control "V-93461" do
  title "Windows Server 2019 manually managed application account passwords must be at least #{input('minimum_password_length_manual')} characters in length."
  desc  "Application/service account passwords must be of sufficient length to prevent being easily cracked. Application/service accounts that are manually managed must have passwords at least #{input('minimum_password_length_manual')} characters in length."
  desc  "rationale", ""
  desc  "check", "Determine if manually managed application/service accounts exist. If none exist, this is NA.

    Verify the organization has a policy to ensure passwords for manually managed application/service accounts are at least #{input('minimum_password_length_manual')} characters in length.

    If such a policy does not exist or has not been implemented, this is a finding."
  desc  "fix", "Establish a policy that requires application/service account passwords that are manually managed to be at least #{input('minimum_password_length_manual')} characters in length. Ensure the policy is enforced."
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000078-GPOS-00046"
  tag gid: "V-93461"
  tag rid: "SV-103547r1_rule"
  tag stig_id: "WN19-00-000050"
  tag fix_id: "F-99705r1_fix"
  tag cci: ["CCI-000205"]
  tag nist: ["IA-5 (1) (a)", "Rev_4"]

  mplm = input('minimum_password_length_manual')

  describe 'Please Check all Accounts that are used for Services or Applications to validate they meet the Password Length Policy, Control is a Manual Check' do
    skip "Determine if manually managed application/service accounts exist. If none exist, this is NA. Verify the organization has a policy to ensure passwords for manually managed application/service accounts are at least #{mplm} characters in length."
  end
end
