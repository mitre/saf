# -*- encoding : utf-8 -*-
require 'puppet'
require File.join(File.dirname(__FILE__), '..', 'firewalld.rb')

Puppet::Type.type(:firewalld_ipset).provide(
  :firewall_cmd,
  :parent => Puppet::Provider::Firewalld
) do
  desc "Interact with firewall-cmd"

  def exists?
    execute_firewall_cmd(['--get-ipsets'], nil).split(" ").include?(@resource[:name])
  end

  def create
    args = []
    args << ["--new-ipset=#{@resource[:name]}"]
    args << ["--type=#{@resource[:type]}"]
    args << ["--option=#{@resource[:options].map { |a,b| "#{a}=#{b}" }.join(',')}"] if @resource[:options]
    execute_firewall_cmd(args.flatten, nil)
    @resource[:entries].each { |e| add_entry(e) }
  end

  def entries
    execute_firewall_cmd(["--ipset=#{@resource[:name]}", "--get-entries"], nil).split("\n").sort
  end

  def add_entry(entry)
    execute_firewall_cmd(["--ipset=#{@resource[:name]}", "--add-entry=#{entry}"], nil)
  end

  def remove_entry(entry)
    execute_firewall_cmd(["--ipset=#{@resource[:name]}", "--remove-entry=#{entry}"], nil)
  end

  def entries=(should_entries)
    cur_entries = entries
    delete_entries = cur_entries-should_entries
    add_entries = should_entries-cur_entries
    delete_entries.each { |e| remove_entry(e) }
    add_entries.each { |e| add_entry(e) }
  end

  def destroy
    execute_firewall_cmd(["--delete-ipset=#{@resource[:name]}"], nil)
  end
end
