# -*- encoding : utf-8 -*-
control "V-72317" do
  title "The Red Hat Enterprise Linux operating system must not have
unauthorized IP tunnels configured."
  desc  "IP tunneling mechanisms can be used to bypass network filtering. If
tunneling is required, it must be documented with the Information System
Security Officer (ISSO)."
  desc  "rationale", ""
  desc  "check", "
    Verify the system does not have unauthorized IP tunnels configured.

    Check to see if \"libreswan\" is installed with the following command:

    # yum list installed libreswan
    libreswan.x86-64 3.20-5.el7_4

    If \"libreswan\" is installed, check to see if the \"IPsec\" service is
active with the following command:

    # systemctl status ipsec
    ipsec.service - Internet Key Exchange (IKE) Protocol Daemon for IPsec
    Loaded: loaded (/usr/lib/systemd/system/ipsec.service; disabled)
    Active: inactive (dead)

    If the \"IPsec\" service is active, check to see if any tunnels are
configured in \"/etc/ipsec.conf\" and \"/etc/ipsec.d/\" with the following
commands:

    # grep -iw conn /etc/ipsec.conf /etc/ipsec.d/*.conf

    If there are indications that a \"conn\" parameter is configured for a
tunnel, ask the System Administrator if the tunnel is documented with the ISSO.

    If \"libreswan\" is installed, \"IPsec\" is active, and an undocumented
tunnel is active, this is a finding.
  "
  desc  "fix", "Remove all unapproved tunnels from the system, or document them
with the ISSO."
  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72317"
  tag rid: "SV-86941r2_rule"
  tag stig_id: "RHEL-07-040820"
  tag fix_id: "F-78671r1_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  approved_tunnels = input('approved_tunnels')

  if package('libreswan').installed? && service('ipsec.service').running?
    impact 0.5
    processed = []
    to_process = ['/etc/ipsec.conf']

    while !to_process.empty?
      in_process = to_process.pop
      next if processed.include? in_process
      processed.push in_process

      to_process.concat(
        command("grep -E '^\\s*include\\s+' #{in_process} | sed 's/^[[:space:]]*include[[:space:]]*//g'").
          stdout.strip.split(%r{\s*\n+\s*}).
          map { |f| f.start_with?('/') ? f : File.join(File.dirname(in_process), f) }.
          map { |f|
            dir = f.sub(%r{[^/]*[\*\?\[].*$}, '') # gets the longest ancestor path which doesn't contain wildcards
            command("find #{dir} -wholename '#{f}'").stdout.strip.split("\n")
          }.
          flatten.
          select { |f| file(f).file? }
      )
    end

    conn_grep = processed.map do |conf|
      command("grep -E '^\\s*conn\\s+' #{conf}").
        stdout.strip.split(%r{\s*\n\s*})
    end.flatten

    describe conn_grep do
      it { should all(be_in approved_tunnels) }
    end
  else
    impact 0.0
    describe "The system does not have libreswan installed or the ipsec.service isn't running" do
      skip "The system does not have libreswan installed or the ipsec.service isn't running, this requirement is Not Applicable."
    end
  end
end

