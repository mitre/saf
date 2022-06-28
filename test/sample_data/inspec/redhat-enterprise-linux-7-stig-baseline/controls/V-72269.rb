# -*- encoding : utf-8 -*-
control "V-72269" do
  title "The Red Hat Enterprise Linux operating system must, for networked
systems, synchronize clocks with a server that is synchronized to one of the
redundant United States Naval Observatory (USNO) time servers, a time server
designated for the appropriate DoD network (NIPRNet/SIPRNet), and/or the Global
Positioning System (GPS)."
  desc  "Inaccurate time stamps make it more difficult to correlate events and
can lead to an inaccurate analysis. Determining the correct time a particular
event occurred on a system is critical when conducting forensic analysis and
investigating system events. Sources outside the configured acceptable
allowance (drift) may be inaccurate.

    Synchronizing internal information system clocks provides uniformity of
time stamps for information systems with multiple system clocks and systems
connected over a network.

    Organizations should consider endpoints that may not have regular access to
the authoritative time server (e.g., mobile, teleworking, and tactical
endpoints).


  "
  desc  "rationale", ""
  desc  "check", "
    Check to see if NTP is running in continuous mode:

    # ps -ef | grep ntp

    If NTP is not running, check to see if \"chronyd\" is running in continuous
mode:

    # ps -ef | grep chronyd

    If NTP or \"chronyd\" is not running, this is a finding.

    If the NTP process is found, then check the \"ntp.conf\" file for the
\"maxpoll\" option setting:

    # grep maxpoll /etc/ntp.conf

    server 0.rhel.pool.ntp.org iburst maxpoll 10

    If the option is set to \"17\" or is not set, this is a finding.

    If the file does not exist, check the \"/etc/cron.daily\" subdirectory for
a crontab file controlling the execution of the \"ntpd -q\" command.

    # grep -i \"ntpd -q\" /etc/cron.daily/*
    # ls -al /etc/cron.* | grep ntp

    ntp

    If a crontab file does not exist in the \"/etc/cron.daily\" that executes
the \"ntpd -q\" command, this is a finding.

    If the \"chronyd\" process is found, then check the \"chrony.conf\" file
for the \"maxpoll\" option setting:

    # grep maxpoll /etc/chrony.conf

    server 0.rhel.pool.ntp.org iburst maxpoll 10

    If the option is not set or the line is commented out, this is a finding.
  "
  desc  "fix", "
    Edit the \"/etc/ntp.conf\" or \"/etc/chrony.conf\" file and add or update
an entry to define \"maxpoll\" to \"10\" as follows:

    server 0.rhel.pool.ntp.org iburst maxpoll 10

    If NTP was running and \"maxpoll\" was updated, the NTP service must be
restarted:

    # systemctl restart ntpd

    If NTP was not running, it must be started:

    # systemctl start ntpd

    If \"chronyd\" was running and \"maxpoll\" was updated, the service must be
restarted:

    # systemctl restart chronyd.service

    If \"chronyd\" was not running, it must be started:

    # systemctl start chronyd.service
  "
  impact 0.5
  tag severity: nil
  tag gtitle: "SRG-OS-000355-GPOS-00143"
  tag satisfies: ["SRG-OS-000355-GPOS-00143", "SRG-OS-000356-GPOS-00144"]
  tag gid: "V-72269"
  tag rid: "SV-86893r5_rule"
  tag stig_id: "RHEL-07-040500"
  tag fix_id: "F-78623r5_fix"
  tag cci: ["CCI-001891", "CCI-002046"]
  tag nist: ["AU-8 (1) (a)", "AU-8 (1) (b)"]

  # Either ntpd or chronyd should be running
  describe.one do
    [service('ntpd'), service('chronyd')].each do |time_service|
      describe time_service do
        it { should be_running }
        it { should be_enabled }
        it { should be_installed }
      end
    end
  end

  if service('ntpd').installed?
    time_service = service('ntpd')
    time_sources = ntp_conf('/etc/ntp.conf').server
    max_poll_values = time_sources.map { |val| val.match?(/.*maxpoll.*/) ? val.gsub(/.*maxpoll\s+(\d+)(\s+.*|$)/,'\1').to_i : 99 }
    ntpdate_crons = command('grep -l "ntpd -q" /etc/cron.daily/*').stdout.strip.lines

    describe "ntpd time sources list" do
      subject { time_sources }
      it { should_not be_empty }
    end

    describe.one do
      # Case where maxpoll empty
      describe "Daily cron jobs for 'ntpd -q'" do
        subject { ntpdate_crons }
        it { should_not be_empty }
      end
      # All time sources must contain valid maxpoll entries
      describe "ntpd maxpoll values (99=maxpoll absent)" do
        subject { max_poll_values }
        it { should all be < 17 }
      end
    end
  end

  if service('chronyd').installed?
    time_service = service('chronyd')
    time_sources = ntp_conf('/etc/chrony.conf').server
    max_poll_values = time_sources.map { |val| val.match?(/.*maxpoll.*/) ? val.gsub(/.*maxpoll\s+(\d+)(\s+.*|$)/,'\1').to_i : 99 }

    describe "chronyd time sources list" do
      subject { time_sources }
      it { should_not be_empty }
    end
      
    # All time sources must contain valid maxpoll entries
    describe "chronyd maxpoll values (99=maxpoll absent)" do
      subject { max_poll_values }
      it { should all be < 17 }
    end
  end
end
