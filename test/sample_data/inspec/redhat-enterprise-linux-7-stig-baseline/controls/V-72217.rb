# -*- encoding : utf-8 -*-
control "V-72217" do
  title "The Red Hat Enterprise Linux operating system must limit the number of
concurrent sessions to 10 for all accounts and/or account types."
  desc  "Operating system management includes the ability to control the number
of users and user sessions that utilize an operating system. Limiting the
number of allowed users and sessions per user is helpful in reducing the risks
related to DoS attacks.

    This requirement addresses concurrent sessions for information system
accounts and does not address concurrent sessions by single users via multiple
system accounts. The maximum number of concurrent sessions should be defined
based on mission needs and the operational environment for each system.
  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system limits the number of concurrent sessions to
\"10\" for all accounts and/or account types by issuing the following command:

    # grep \"maxlogins\" /etc/security/limits.conf /etc/security/limits.d/*.conf

    * hard maxlogins 10

    This can be set as a global domain (with the * wildcard) but may be set
differently for multiple domains.

    If the \"maxlogins\" item is missing, commented out, or the value is not
set to \"10\" or less for all domains that have the \"maxlogins\" item
assigned, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to limit the number of concurrent sessions
to \"10\" for all accounts and/or account types.

    Add the following line to the top of the /etc/security/limits.conf or in a
\".conf\" file defined in /etc/security/limits.d/ :

    * hard maxlogins 10
  "
  impact 0.3
  tag severity: nil
  tag gtitle: "SRG-OS-000027-GPOS-00008"
  tag gid: "V-72217"
  tag rid: "SV-86841r3_rule"
  tag stig_id: "RHEL-07-040000"
  tag fix_id: "F-78571r2_fix"
  tag cci: ["CCI-000054"]
  tag nist: ["AC-10"]

  maxlogins_limit = input('maxlogins_limit')

  # Collect any files under limits.d if they exist
  limits_files = directory('/etc/security/limits.d').exist? ? command('ls /etc/security/limits.d/*.conf').stdout.strip.lines : []
  # Add limits.conf to the list
  limits_files.push('/etc/security/limits.conf')
  compliant_files = []
  noncompliant_files = []

  limits_files.each do |limits_file|
    # Get any universal limits from each file
    local_limits = limits_conf(limits_file).*
    # If we got an array (results) check further
    if local_limits.is_a?(Array)
      local_limits.each do |temp_limit|
        # For each result check if it is a 'hard' limit for 'maxlogins'
        if temp_limit.include?('hard') && temp_limit.include?('maxlogins')
          # If the limit is in range, push to compliant files
          if temp_limit[-1].to_i <= maxlogins_limit
            compliant_files.push(limits_file)
          # Otherwise add to noncompliant files
          else
            noncompliant_files.push(limits_file)
          end
        end
      end
    end
  end

  # It is required that at least 1 file contain compliant configuration
  describe "Files configuring maxlogins less than or equal to #{maxlogins_limit}" do
    subject { compliant_files.length }
    it { should be_positive }
  end

  # No files should set 'hard' 'maxlogins' to any noncompliant value
  describe "Files configuring maxlogins greater than #{maxlogins_limit}" do
    subject { noncompliant_files }
    it { should cmp [] }
  end
end
