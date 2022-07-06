# -*- encoding : utf-8 -*-
Puppet::Type.type(:foreman_config_entry).provide(:cli) do

  desc "foreman_config_entry's CLI provider"

  confine :exists => '/usr/sbin/foreman-rake'

  mk_resource_methods

  def self.run_foreman_config(args = "", options = {})
    Dir.chdir('/usr/share/foreman') do
      command = "/usr/sbin/foreman-rake -- config #{args}"
      if Puppet::PUPPETVERSION.to_f < 3.4
        old_home = ENV['HOME']
        begin
          ENV['HOME'] = '/usr/share/foreman'
          output, status = Puppet::Util::SUIDManager.run_and_capture(command, 'foreman', 'foreman')
        ensure
          ENV['HOME'] = old_home
        end
      else
        output = Puppet::Util::Execution.execute(command,
          { :failonfail         => false,
            :combine            => false,
            :custom_environment => { 'HOME' => '/usr/share/foreman' },
            :uid                => 'foreman',
            :gid                => 'foreman' }.merge(options)
        )
        status = $?
      end
      output if status.success?
    end
  end

  def run_foreman_config(*args)
    self.class.run_foreman_config(*args)
  end

  def self.instances
    output = run_foreman_config
    return if output.nil?
    output.split("\n").map do |line|
        name, value = line.split(':', 2)
        new(
          :name  => name,
          :value => value.strip
        ) unless value.nil?
    end.compact
  end

  def self.prefetch(resources)
    entries = instances
    return if entries.nil?
    resources.each do |name, resource|
      provider = entries.find { |entry| entry.name == name }
      if provider.nil? && resource[:ignore_missing]
        # just assume it already has the value we expect
        provider = new(:name => name, :value => resource[:value])
      end
      resources[name].provider = provider if provider
    end
  end

  def value
    if @property_hash[:value].nil?
      value = run_foreman_config("-k '#{name}'").to_s.chomp
      if value.empty? && resource[:ignore_missing]
        @property_hash[:value] = resource[:value]
      else
        @property_hash[:value] = value
      end
    else
      @property_hash[:value]
    end
  end

  def value=(value)
    return if resource[:dry]
    run_foreman_config("-k '#{name}' -v '#{value}'", :combine => true, :failonfail => true)
    @property_hash[:value] = value
  end

end
