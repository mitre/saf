# -*- encoding : utf-8 -*-
# copyright: 2016, Christoph Hartmann
# copyright: 2016, Dominik Richter
# license: MPLv2
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

require 'json'
require 'rexml/document'

class LinuxUpdateManager < Inspec.resource(1)
  name 'linux_update'
  desc 'Use the linux_update InSpec audit resource to test for available or installed updates'

  # def initialize
  #   if inspec.os.redhat?
  #     @update_mgmt = RHELUpdateFetcher.new(inspec)
  #   elsif inspec.os.debian?
  #     @update_mgmt = UbuntuUpdateFetcher.new(inspec)
  #   end
  #   return skip_resource 'The `linux_update` resource is not supported on your OS.' if @update_mgmt.nil?
  # end

  # Since Amazon Linux is based on RedHat, they may use the same method.
  def initialize
    case inspec.os[:family]
    when 'redhat', 'amazon'
      @update_mgmt = RHELUpdateFetcher.new(inspec)
    when 'debian'
      @update_mgmt = UbuntuUpdateFetcher.new(inspec)
    when 'suse'
      @update_mgmt = SuseUpdateFetcher.new(inspec)
    end
    skip_resource 'The `linux_update` resource is not supported on your OS.' if @update_mgmt.nil?
  end

  def updates
    return [] if @update_mgmt.nil?
    u = @update_mgmt.updates
    return [] if u.nil? || u.empty?
    u['available']
  end

  def uptodate?
    return nil if @update_mgmt.nil?
    u = @update_mgmt.updates
    return false if u.nil? || !u['available'].empty?
    l = @update_mgmt.patches
    return false if l.nil? || !l.empty?
    true
  end

  def packages
    return [] if @update_mgmt.nil?
    p = @update_mgmt.packages
    return [] if p.nil? || p.empty?
    p['installed']
  end

  def patches
    return [] if @update_mgmt.nil?
    @update_mgmt.patches || []
  end

  def to_s
    'Linux Update'
  end
end

class UpdateFetcher
  def initialize(inspec)
    @inspec = inspec
  end

  def packages
    []
  end

  def updates
    []
  end

  def patches
    []
  end

  def parse_json(script)
    cmd = @inspec.bash(script)
    begin
      JSON.parse(cmd.stdout)
    rescue JSON::ParserError => _e
      return []
    end
  end
end

PatchEntry = Struct.new(:name, :version, :arch, :category, :severity) do
  def to_s
    r = "System Patch #{name} (v#{version} #{arch}"
    r+= ", #{category}" unless category.nil?
    r+= ", #{severity}" unless severity.nil?
    r + ')'
  end
end

class SuseUpdateFetcher < UpdateFetcher
  def patches
    out = zypper_xml('list-updates -t patch')
    xml = REXML::Document.new(out)

    extract_xml_updates(REXML::XPath.first(xml, '//update-list')) +
      extract_xml_updates(REXML::XPath.first(xml, '//blocked-update-list'))
  end

  def updates
    out = zypper_xml('list-updates')
    xml = REXML::Document.new(out)

    res = extract_xml_updates(REXML::XPath.first(xml, '//update-list')) +
          extract_xml_updates(REXML::XPath.first(xml, '//blocked-update-list'))

    { 'available' => res }
  end

  private

  def zypper_xml(cmd)
    out = @inspec.command('zypper --xmlout '+cmd)
    if out.exit_status != 0
      fail_resource('Cannot retrieve package updates from the OS: '+out.stderr)
    end
    out.stdout.force_encoding('UTF-8')
  end

  def extract_xml_updates(updates_el)
    res = []
    return res if updates_el.nil?

    REXML::XPath.each(updates_el, 'update') do |el|
      a = el.attributes
      res.push(
        PatchEntry.new(a['name'], a['edition'], a['arch'], a['category'], a['severity']),
      )
    end
    res
  end
end

class UbuntuUpdateFetcher < UpdateFetcher
  def packages
    ubuntu_packages = ubuntu_base + <<-PRINT_JSON
echo -n '{"installed":['
dpkg-query -W -f='${Status}\\t${Package}\\t${Version}\\t${Architecture}\\n' |\\
  grep '^install ok installed\\s' |\\
  awk '{ printf "{\\"name\\":\\""$4"\\",\\"version\\":\\""$5"\\",\\"arch\\":\\""$6"\\"}," }' | rev | cut -c 2- | rev | tr -d '\\n'
echo -n ']}'
PRINT_JSON
    parse_json(ubuntu_packages)
  end

  def updates
    ubuntu_updates = ubuntu_base + <<-PRINT_JSON
echo -n '{"available":['
DEBIAN_FRONTEND=noninteractive apt-get upgrade --dry-run | grep Inst | tr -d '[]()' |\\
  awk '{ printf "{\\"name\\":\\""$2"\\",\\"version\\":\\""$4"\\",\\"repo\\":\\""$5"\\",\\"arch\\":\\""$6"\\"}," }' | rev | cut -c 2- | rev | tr -d '\\n'
echo -n ']}'
PRINT_JSON
    parse_json(ubuntu_updates)
  end

  private

  def ubuntu_base
    base = <<-PRINT_JSON
#!/bin/sh
DEBIAN_FRONTEND=noninteractive apt-get update >/dev/null 2>&1
readlock() { cat /proc/locks | awk '{print $5}' | grep -v ^0 | xargs -I {1} find /proc/{1}/fd -maxdepth 1 -exec readlink {} \\; | grep '^/var/lib/dpkg/lock$'; }
while test -n "$(readlock)"; do sleep 1; done
echo " "
PRINT_JSON
    base
  end
end

class RHELUpdateFetcher < UpdateFetcher
  def packages
    rhel_packages = <<-PRINT_JSON
sleep 2 && echo " "
echo -n '{"installed":['
rpm -qa --queryformat '"name":"%{NAME}","version":"%{VERSION}-%{RELEASE}","arch":"%{ARCH}"\\n' |\\
  awk '{ printf "{"$1"}," }' | rev | cut -c 2- | rev | tr -d '\\n'
echo -n ']}'
PRINT_JSON
    parse_json(rhel_packages)
  end

  def updates
    rhel_updates = <<-PRINT_JSON
#!/bin/sh
python -c 'import sys; sys.path.insert(0, "/usr/share/yum-cli"); import cli; ybc = cli.YumBaseCli(); ybc.setCacheDir("/tmp"); list = ybc.returnPkgLists(["updates"]);res = ["{\\"name\\":\\""+x.name+"\\", \\"version\\":\\""+x.version+"-"+x.release+"\\",\\"arch\\":\\""+x.arch+"\\",\\"repository\\":\\""+x.repo.id+"\\"}" for x in list.updates]; print "{\\"available\\":["+",".join(res)+"]}"'
PRINT_JSON
    cmd = @inspec.bash(rhel_updates)
    unless cmd.exit_status == 0
      # essentially we want https://github.com/chef/inspec/issues/1205
      STDERR.puts 'Could not determine patch status.'
      return nil
    end

    first = cmd.stdout.index('{')
    res = cmd.stdout.slice(first, cmd.stdout.size - first)
    begin
      JSON.parse(res)
    rescue JSON::ParserError => _e
      return []
    end
  end
end
