# -*- encoding : utf-8 -*-
control "V-71947" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that users must provide a password for privilege escalation."
  desc  "Without re-authentication, users may access resources or perform tasks
for which they do not have authorization.

    When operating systems provide the capability to escalate a functional
capability, it is critical the user re-authenticate.


  "
  desc  "rationale", ""
  desc  "check", "
    If passwords are not being used for authentication, this is Not Applicable.

    Verify the operating system requires users to supply a password for
privilege escalation.

    Check the configuration of the \"/etc/sudoers\" and \"/etc/sudoers.d/*\"
files with the following command:

    # grep -i nopasswd /etc/sudoers /etc/sudoers.d/*

    If any uncommented line is found with a \"NOPASSWD\" tag, this is a finding.
  "
  desc  "fix", "
    Configure the operating system to require users to supply a password for
privilege escalation.

    Check the configuration of the \"/etc/sudoers\" file with the following
command:
    # visudo

    Remove any occurrences of \"NOPASSWD\" tags in the file.

    Check the configuration of the /etc/sudoers.d/* files with the following
command:
    # grep -i nopasswd /etc/sudoers.d/*

    Remove any occurrences of \"NOPASSWD\" tags in the file.
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000373-GPOS-00156"
  tag satisfies: ["SRG-OS-000373-GPOS-00156", "SRG-OS-000373-GPOS-00157",
"SRG-OS-000373-GPOS-00158"]
  tag gid: "V-71947"
  tag rid: "SV-86571r3_rule"
  tag stig_id: "RHEL-07-010340"
  tag fix_id: "F-78299r2_fix"
  tag cci: ["CCI-002038"]
  tag nist: ["IA-11"]

  processed = []
  to_process = ['/etc/sudoers', '/etc/sudoers.d']

  while !to_process.empty?
    in_process = to_process.pop
    next if processed.include? in_process
    processed.push in_process

    if file(in_process).directory?
      to_process.concat(
        command("find #{in_process} -maxdepth 1 -mindepth 1").
          stdout.strip.split("\n").
          select { |f| file(f).file? }
      )
    elsif file(in_process).file?
      to_process.concat(
        command("grep -E '#include\\s+' #{in_process} | sed 's/.*#include[[:space:]]*//g'").
          stdout.strip.split("\n").
          map { |f| f.start_with?('/') ? f : File.join(File.dirname(in_process), f) }.
          select { |f| file(f).exist? }
      )
      to_process.concat(
        command("grep -E '#includedir\\s+' #{in_process} | sed 's/.*#includedir[[:space:]]*//g'").
          stdout.strip.split("\n").
          map { |f| f.start_with?('/') ? f : File.join(File.dirname(in_process), f) }.
          select { |f| file(f).exist? }
      )
    end
  end

  sudoers = processed.select { |f| file(f).file? }

  sudoers.each do |sudoer|
    sudo_content = file(sudoer).content.strip.split("\n")
    nopasswd_lines = sudo_content.select { |l| l.match?(/^[^#].*NOPASSWD/) }
    describe "#{sudoer} rules containing NOPASSWD" do
      subject { nopasswd_lines }
      it { should be_empty }
    end
  end
end

