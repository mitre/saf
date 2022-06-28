# -*- encoding : utf-8 -*-
control "V-72313" do
  title "SNMP community strings on the Red Hat Enterprise Linux operating
system must be changed from the default."
  desc  "Whether active or not, default Simple Network Management Protocol
(SNMP) community strings must be changed to maintain security. If the service
is running with the default authenticators, anyone can gather data about the
system and the network and use the information to potentially compromise the
integrity of the system or network(s). It is highly recommended that SNMP
version 3 user authentication and message encryption be used in place of the
version 2 community strings."
  desc  "rationale", ""
  desc  "check", "
    Verify that a system using SNMP is not using default community strings.

    Check to see if the \"/etc/snmp/snmpd.conf\" file exists with the following
command:

    # ls -al /etc/snmp/snmpd.conf
     -rw-------   1 root root      52640 Mar 12 11:08 snmpd.conf

    If the file does not exist, this is Not Applicable.

    If the file does exist, check for the default community strings with the
following commands:

    # grep public /etc/snmp/snmpd.conf
    # grep private /etc/snmp/snmpd.conf

    If either of these commands returns any output, this is a finding.
  "
  desc  "fix", "If the \"/etc/snmp/snmpd.conf\" file exists, modify any lines
that contain a community string value of \"public\" or \"private\" to another
string value."

  tag severity: nil
  tag gtitle: "SRG-OS-000480-GPOS-00227"
  tag gid: "V-72313"
  tag rid: "SV-86937r2_rule"
  tag stig_id: "RHEL-07-040800"
  tag fix_id: "F-78667r1_fix"
  tag cci: ["CCI-000366"]
  tag nist: ["CM-6 b"]

  if file('/etc/snmp/snmpd.conf').exist?
    impact 0.7
    processed = []
    to_process = ['/etc/snmp/snmpd.conf']

    while !to_process.empty?
      in_process = to_process.pop
      next if processed.include? in_process
      processed.push in_process

      if file(in_process).directory?
        to_process.concat(
          command("find #{in_process} -maxdepth 1 -mindepth 1 -name '*.conf'").
            stdout.strip.split("\n").
            select { |f| file(f).file? }
        )
      elsif file(in_process).file?
        to_process.concat(
          command("grep -E '^\\s*includeFile\\s+' #{in_process} | sed 's/^[[:space:]]*includeFile[[:space:]]*//g'").
            stdout.strip.split(%r{\n+}).
            map { |f| f.start_with?('/') ? f : File.join(File.dirname(in_process), f) }.
            select { |f| file(f).file? }
        )
        to_process.concat(
          command("grep -E '^\\s*includeDir\\s+' #{in_process} | sed 's/^[[:space:]]*includeDir[[:space:]]*//g'").
            stdout.strip.split(%r{\n+}).
            map { |f| f.start_with?('/') ? f : File.join('/', f) }. # relative dirs are treated as absolute
            select { |f| file(f).directory? }
        )
      end
    end

    config_files = processed.select { |f| file(f).file? }

    config_files.each do |config|
      describe file(config) do
        its('content') { should_not match %r{^[^#]*(public|private)} }
      end
    end
  else
    impact 0.0
    describe "The `snmpd.conf` does not exist" do
      skip "The snmpd.conf file does not exist, this control is Not Applicable"
    end
  end
end

