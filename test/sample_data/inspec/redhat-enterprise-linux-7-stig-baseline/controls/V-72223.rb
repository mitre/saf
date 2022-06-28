# -*- encoding : utf-8 -*-
control "V-72223" do
  title "The Red Hat Enterprise Linux operating system must be configured so
that all network connections associated with a communication session are
terminated at the end of the session or after 10 minutes of inactivity from the
user at a command prompt, except to fulfill documented and validated mission
requirements."
  desc  "Terminating an idle session within a short time period reduces the
window of opportunity for unauthorized personnel to take control of a
management session enabled on the console or console port that has been left
unattended. In addition, quickly terminating an idle session will also free up
resources committed by the managed network element.

    Terminating network connections associated with communications sessions
includes, for example, de-allocating associated TCP/IP address/port pairs at
the operating system level and de-allocating networking assignments at the
application level if multiple application sessions are using a single operating
system-level network connection. This does not mean that the operating system
terminates all sessions or network access; it only ends the inactive session
and releases the resources associated with that session.
  "
  desc  "rationale", ""
  desc  "check", "
    Verify the operating system terminates all network connections associated
with a communications session at the end of the session or based on inactivity.

    Check the value of the system inactivity timeout with the following command:

    # grep -i tmout /etc/profile.d/*

    etc/profile.d/tmout.sh:TMOUT=600

    /etc/profile.d/tmout.sh:readonly TMOUT

    /etc/profile.d/tmout.sh:export TMOUT

    If \"TMOUT\" is not set to \"600\" or less in a script located in the
/etc/profile.d/ directory to enforce session termination after inactivity, this
is a finding.
  "
  desc  "fix", "
    Configure the operating system to terminate all network connections
associated with a communications session at the end of the session or after a
period of inactivity.

    Create a script to enforce the inactivity timeout (for example
/etc/profile.d/tmout.sh) such as:

    #!/bin/bash

    TMOUT=600
    readonly TMOUT
    export TMOUT
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000163-GPOS-00072"
  tag gid: "V-72223"
  tag rid: "SV-86847r4_rule"
  tag stig_id: "RHEL-07-040160"
  tag fix_id: "F-78577r5_fix"
  tag cci: ["CCI-001133", "CCI-002361"]
  tag nist: ["SC-10", "AC-12"]

  system_activity_timeout = input('system_activity_timeout')

  # Get current TMOUT environment variable (active test)
  describe 'Environment variable TMOUT' do
    subject { os_env('TMOUT').content.to_i }
    it { should be <= system_activity_timeout }
  end

  # Check if TMOUT is set in files (passive test)
  files = ['/etc/bashrc'] + ['/etc/profile'] + command("find /etc/profile.d/*").stdout.split("\n")
  latest_val = nil

  files.each do |file|
    readonly = false

    # Skip to next file if TMOUT isn't present. Otherwise, get the last occurrence of TMOUT
    next if (values = command("grep -Po '.*TMOUT.*' #{file}").stdout.split("\n")).empty?

    # Loop through each TMOUT match and see if set TMOUT's value or makes it readonly
    values.each_with_index { |value, index|

      # Skip if starts with '#' - it represents a comment
      next if !value.match(/^#/).nil?
      # If readonly and value is inline - use that value
      if !value.match(/^readonly[\s]+TMOUT[\s]*=[\s]*[\d]+$/).nil?
        latest_val = value.match(/[\d]+/)[0].to_i
        readonly = true
        break
      # If readonly, but, value is not inline - use the most recent value
      elsif !value.match(/^readonly[\s]+([\w]+[\s]+)?TMOUT[\s]*([\s]+[\w]+[\s]*)*$/).nil?
        # If the index is greater than 0, the configuraiton setting value.
        # Otherwise, the configuration setting value is in the previous file
        # and is already set in latest_val.
        if index >= 1
          latest_val = values[index - 1].match(/[\d]+/)[0].to_i
        end
        readonly = true
        break
      # Readonly is not set use the lastest value
      else
        latest_val = value.match(/[\d]+/)[0].to_i
      end
    }
   # Readonly is set - stop processing files
    break if readonly === true
  end

  if latest_val.nil?
    describe "The TMOUT setting is configured" do
      subject { !latest_val.nil? }
      it { should be true }
    end
  else
    describe"The TMOUT setting is configured properly" do
      subject { latest_val }
      it { should be <= system_activity_timeout }
    end
  end
end

