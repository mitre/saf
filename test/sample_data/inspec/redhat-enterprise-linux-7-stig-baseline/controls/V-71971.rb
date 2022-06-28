# -*- encoding : utf-8 -*-
control "V-71971" do
  title "The Red Hat Enterprise Linux operating system must prevent
non-privileged users from executing privileged functions to include disabling,
circumventing, or altering implemented security safeguards/countermeasures."
  desc  "Preventing non-privileged users from executing privileged functions
mitigates the risk that unauthorized individuals or processes may gain
unnecessary access to information or privileges.

    Privileged functions include, for example, establishing accounts,
performing system integrity checks, or administering cryptographic key
management activities. Non-privileged users are individuals who do not possess
appropriate authorizations. Circumventing intrusion detection and prevention
mechanisms or malicious code protection mechanisms are examples of privileged
functions that require protection from non-privileged users.
  "
  desc  "rationale", ""
  desc  "check", "
    If an HBSS or HIPS is active on the system, this is Not Applicable.

    Verify the operating system prevents non-privileged users from executing
privileged functions to include disabling, circumventing, or altering
implemented security safeguards/countermeasures.

    Get a list of authorized users (other than System Administrator and guest
accounts) for the system.

    Check the list against the system by using the following command:

    # semanage login -l | more
    Login Name SELinux User MLS/MCS Range Service
    __default__ user_u s0-s0:c0.c1023 *
    root unconfined_u s0-s0:c0.c1023 *
    system_u system_u s0-s0:c0.c1023 *
    joe staff_u s0-s0:c0.c1023 *

    All administrators must be mapped to the \"sysadm_u\" or \"staff_u\" users
role.

    All authorized non-administrative users must be mapped to the \"user_u\"
role.

    If they are not mapped in this way, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to prevent non-privileged users from
executing privileged functions to include disabling, circumventing, or altering
implemented security safeguards/countermeasures.

    Use the following command to map a new user to the \"sysdam_u\" role:

    #semanage login -a -s sysadm_u <username>

    Use the following command to map an existing user to the \"sysdam_u\" role:

    #semanage login -m -s sysadm_u <username>

    Use the following command to map a new user to the \"staff_u\" role:

    #semanage login -a -s staff_u <username>

    Use the following command to map an existing user to the \"staff_u\" role:

    #semanage login -m -s staff_u <username>

    Use the following command to map a new user to the \"user_u\" role:

    # semanage login -a -s user_u <username>

    Use the following command to map an existing user to the \"user_u\" role:

    # semanage login -m -s user_u <username>
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000324-GPOS-00125"
  tag gid: "V-71971"
  tag rid: "SV-86595r2_rule"
  tag stig_id: "RHEL-07-020020"
  tag fix_id: "F-78323r1_fix"
  tag cci: ["CCI-002165", "CCI-002235"]
  tag nist: ["AC-3 (4)", "AC-6 (10)"]

  admin_logins = input('admin_logins')

  if package('MFEhiplsm').installed? && processes(/hipclient/).exist?
    impact 0.0
    describe "HIPS is active on the system" do
      skip "A HIPS process is active on the system, this control is Not Applicable."
    end
  elsif service('cma').installed? && service('cma').enabled?
    impact 0.0
    describe "HBSS is active on the system" do
      skip "A HBSS service is active on the system, this control is Not Applicable."
    end
  else
    impact 0.5
    describe command('selinuxenabled') do
      its('exist?') { should be true }
      its('exit_status') { should eq 0 }
    end

    selinux_mode = file('/etc/selinux/config').content.lines.
      grep(/\A\s*SELINUXTYPE=/).last.split('=').last.strip

    seusers = file("/etc/selinux/#{selinux_mode}/seusers").content.lines.
      grep_v(/(#|\A\s+\Z)/).map(&:strip)

    seusers = seusers.map{|x| x.split(':')[0..1]}

    describe 'seusers' do
      it { expect(seusers).to_not be_empty }
    end

    users_to_ignore = [
      'root',
      'system_u'
    ]

    seusers.each do |user, context|
      next if users_to_ignore.include?(user)

      describe "SELinux login #{user}" do
        if user == '__default__'
          let(:valid_users){[ 'user_u' ]}
        elsif admin_logins.include?(user)
          let(:valid_users){[
            'sysadm_u',
            'staff_u'
          ]}
        else
          let(:valid_users){[
            'user_u',
            'guest_u',
            'xguest_u'
          ]}
        end

        it { expect(context).to be_in(valid_users) }
      end
    end
  end
end

