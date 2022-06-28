# -*- encoding : utf-8 -*-
control "V-77825" do
  title "The Red Hat Enterprise Linux operating system must implement virtual
address space randomization."
  desc  "Address space layout randomization (ASLR) makes it more difficult for
an attacker to predict the location of attack code he or she has introduced
into a process's address space during an attempt at exploitation. Additionally,
ASLR also makes it more difficult for an attacker to know the location of
existing code in order to repurpose it using return-oriented programming (ROP)
techniques."
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system implements virtual address space randomization.

    # grep kernel.randomize_va_space /etc/sysctl.conf /etc/sysctl.d/*

    kernel.randomize_va_space = 2

    If \"kernel.randomize_va_space\" is not configured in the /etc/sysctl.conf
file or in the /etc/sysctl.d/ directory, is commented out or does not have a
value of \"2\", this is a finding.

    Check that the operating system implements virtual address space
randomization with the following command:

    # /sbin/sysctl -a | grep kernel.randomize_va_space

    kernel.randomize_va_space = 2

    If \"kernel.randomize_va_space\" does not have a value of \"2\", this is a
finding.
  "
  desc  "fix", "
    Configure the operating system implement virtual address space
randomization.

    Set the system to the required kernel parameter by adding the following
line to \"/etc/sysctl.conf\" or a config file in the /etc/sysctl.d/ directory
(or modify the line to have the required value):

    kernel.randomize_va_space = 2

    Issue the following command to make the changes take effect:

    # sysctl --system
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-77825"
  tag rid: "SV-92521r2_rule"
  tag stig_id: "RHEL-07-040201"
  tag fix_id: "F-84531r2_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  randomize_va_space = input('randomize_va_space')

  describe kernel_parameter('kernel.randomize_va_space') do
    its('value') { should eq randomize_va_space }
  end
end

