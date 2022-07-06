# -*- encoding : utf-8 -*-
Puppet::Type.newtype(:foreman_config_entry) do

  desc 'foreman_config_entry set a foreman parameter'

  newparam(:name) do
    desc 'The name of the parameter.'
  end

  newproperty(:value) do
    desc 'The value of the parameter.'

    munge { |val| val.to_s }
  end

  newparam(:dry) do
    desc "Don't update the value."
  end

  newparam(:ignore_missing) do
    desc "Do nothing when the config option is not available."
  end

end
