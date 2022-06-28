# -*- encoding : utf-8 -*-
Puppet::Type.type(:foreman_hostgroup).provide(:rest_v2) do

  confine :feature => :apipie_bindings

  # when both rest and rest_v2 providers are installed, use this one
  def self.specificity
    super + 1
  end

  def settings
    if @settings
      @settings
    else
      begin
        @settings = YAML.load_file('/etc/foreman/settings.yaml')
      rescue
        Puppet.send(:debug, 'unable to load /etc/foreman/settings.yml')
        @settings = {}
      end
    end
  end

  def api
    if resource[:consumer_key]
      key = resource[:consumer_key]
    else
      key = settings[:oauth_consumer_key]
    end

    if resource[:consumer_secret]
      secret = resource[:consumer_secret]
    else
      secret = settings[:oauth_consumer_secret]
    end

    @api ||= ApipieBindings::API.new({
      :uri => resource[:base_url],
      :api_version => 2,
      :oauth => {
        :consumer_key    => key,
        :consumer_secret => secret
      },
      :timeout => resource[:timeout],
      :headers => {
        :foreman_user => resource[:effective_user],
      },
      :apidoc_cache_base_dir => File.join(Puppet[:vardir], 'apipie_bindings')
    })
  end

  def smartproxies
    @smartproxies ||= api.resource(:smart_proxies)
  end

#
#  Puppetmaster Proxy section
#

  def puppetmaster=(value)
    hostgroups.call(:update, { :id => id, :hostgroup => { :puppet_proxy_id => puppetmaster_object["id"]}})
  rescue Exception => e
    fail "Hostgroup #{resource[:name]} cannot update puppetmaster: (#{e.message}): #{e.backtrace[0]}"
  end

  def puppetmaster_object
    smartproxies.call(:index, :search => "name=#{resource[:puppetmaster]}")['results'][0]
  end

  def puppetmaster_id
    hostgroup ? hostgroup["puppet_proxy_id"] : nil
  end

  def puppetmaster
    puppetmaster_id ? smartproxies.call(:show, :id => puppetmaster_id)["name"] : nil
  end

#
#  Puppet CA Proxy section
#

  def puppet_ca=(value)
    hostgroups.call(:update, { :id => id, :hostgroup => { :puppet_ca_proxy_id => puppet_ca_object["id"]}})
  rescue Exception => e
    fail "Hostgroup #{resource[:name]} cannot update puppet CA: (#{e.message}): #{e.backtrace[0]}"
  end

  def puppet_ca_object
    smartproxies.call(:index, :search => "name=#{resource[:puppet_ca]}")['results'][0]
  end

  def puppet_ca_id
    hostgroup ? hostgroup["puppet_ca_proxy_id"] : nil
  end

  def puppet_ca
    puppet_ca_id ? smartproxies.call(:show, :id => puppet_ca_id)["name"] : nil
  end

#
#  Environment section
#
  def environment
    @hostgroup ? hostgroup["environment_name"] : nil
  end

  def environment=(value)
    hostgroups.call(:update, { :id => id, :hostgroup => { :environment_name => resource[:environment]}})
  rescue Exception => e
    fail "Hostgroup #{resource[:name]} cannot update environment: (#{e.message}): #{e.backtrace[0]}"
  end

#
# Parent section
#

  def parent_object
    hostgroups.call(:index, :search => "name=#{resource[:parent]}")['results'][0]
  end

  def parent_id
    parent_object ? parent_object['id'] : nil
  end

  def parent
    hostgroup['ancestry'] ? hostgroups.call(:show, :id => hostgroup['ancestry'])['name'] : nil
  end

  def parent=(value)
    hostgroups.call(:update, { :id => id, :hostgroup => { :ancestry => "#{parent_id}" }})
  rescue Exception => e
    fail "Hostgroup #{resource[:name]} cannot update parent: (#{e.message}): #{e.backtrace[0]}"
  end

#
#  Hostgroup Class Associations section
#

  def hostgroupclass_api
    @hostgroupclass_api ||= api.resource(:hostgroup_classes)
  end

  def hostgroupclasses(local_id)
    classes = hostgroupclass_api.call(:index, "hostgroup_id" => local_id)["results"].inject({}){|h,c|
      obj = puppetclass_object(:id => c)
      obj ? h.merge(obj["name"] => obj["id"]) : h
    }

    ancestry = hostgroups.call(:show, :id => local_id)['ancestry']
    if ancestry
      classes.merge(hostgroupclasses(ancestry))
    else
      classes
    end
  end

  def puppetclass_api
    @puppetclass_api ||= api.resource(:puppetclasses)
  end

  def puppetclass_object(params)
    if params[:name]
      obj = puppetclass_api.call(:index, :search => "name=#{params[:name]}")['results']
      key = obj.keys[0]
      if key.nil?
        fail("Unable to locate Puppetclass #{params[:name]}.")
        nil
      else
        obj[key][0]
      end
    elsif params[:id]
      puppetclass_api.call(:show, :id => params[:id])
    end
  end

  def puppetclass
    hostgroupclasses(id).keys
  end

  def puppetclass=(classes)
    class_ids = classes.inject([]){|a,c|
      obj = puppetclass_object(:name => c)
      obj ? a.push(obj['id']) : a
    }

    add    = class_ids - hostgroupclasses(id).values
    remove = hostgroupclasses(id).values - class_ids

    remove.each{|cid|
      hostgroupclass_api.call(:destroy, {"id" => cid, "hostgroup_id" => id})
    }

    add.each{|cid|
      hostgroupclass_api.call(:create, "puppetclass_id" => cid, "hostgroup_id" => id)
    }

  rescue Exception => e
    fail "Hostgroup #{resource[:name]} cannot update Puppet Classes: (#{e.message}): #{e.backtrace[0]}"
  end

#
#  Organization section
#
  def organizations
    if settings[:organizations_enabled]
      hostgroup['organizations'].map{|l| l['name'] }
    else
      warn('Organizations not enabled, unable to set organization')
      resource[:organizations]
    end
  end

  def organizations=(values)
    if values.class == String
      values = [values]
    end

    hostgroups.call(:update, { :id => id, :hostgroup => { :organization_names => values }})
  rescue Exception => e
    fail "Hostgroup #{resource[:name]} cannot update organizations: (#{e.message}): #{e.backtrace[0]}"
  end

#
#  Location section
#
  def locations
    if settings[:locations_enabled]
      hostgroup['locations'].map{|l| l['name'] }
    else
      warn('Locations not enabled, unable to set location')
      resource[:locations]
    end
  end

  def locations=(values)
    if values.class == String
      values = [values]
    end

    hostgroups.call(:update, { :id => id, :hostgroup => { :location_names => values }})
  rescue Exception => e
    fail "Hostgroup #{resource[:name]} cannot update locations: (#{e.message}): #{e.backtrace[0]}"
  end

#
# Hostgroup Section
#

  def hostgroups
    @hostgroups ||= api.resource(:hostgroups)
  end

  # hostgroup hash or nil
  def hostgroup
    if @hostgroup
      @hostgroup
    else
      group = hostgroups.call(:index, :search => "name=#{resource[:name]}")['results'][0]
      if not group.nil?
        @hostgroup = hostgroups.call(:show, :id => group['id'])
      else
        @hostgroup = nil
      end
    end
  rescue Exception => e
    fail "Hostgroup #{resource[:name]} locate hostgroup: (#{e.message}): #{e.backtrace[0]}"
  end

  def id
    hostgroup ? hostgroup['id'] : nil
  end

  def exists?
    ! id.nil?
  end

  def create
    new_hostgroup = {
      :hostgroup => {
        :name => resource[:name],
        :puppet_proxy_name => resource[:puppetmaster],
        :puppet_ca_proxy_name => resource[:puppet_ca],
        :environment_name => resource[:environment],
        :puppetclass_names => resource[:puppetclass],
        :organization_names => resource[:organizations],
        :location_names => resource[:locations],
        :ancestry => parent_id
      }.reject{|k,v| v.nil? }
    }

    hostgroups.call(:create, new_hostgroup)

    refresh_features!
  rescue Exception => e
    fail "Hostgroup #{resource[:name]} create hostgroup: (#{e.message}): #{e.backtrace[0]}"
  end

  def destroy
    hostgroups.call(:destroy, :id => id)
    @hostgroup = nil
  rescue Exception => e
    fail "Hostgroup #{resource[:name]} destroy hostgroup: (#{e.message}): #{e.backtrace[0]}"
  end

  def refresh_features!
    @hostgroup = nil
    hostgroup
  rescue Exception => e
    fail "Hostgroup #{resource[:name]} refresh hostgroup: (#{e.message}): #{e.backtrace[0]}"
  end
end
