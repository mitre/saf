# Changelog

## 7.2.0
* New or changed parameters:
    * Add `$ssl_ca_file` to foreman::cli to specify the path to the SSL CA
      file for hammer_cli
    * Add `$access_log_format` to foreman::config:passenger. This is passed to
      apache::vhost to allow overriding the apache log format.
* Other changes and fixes:
    * Extend gzip file serving to /public/webpack
    * Restrict gzip asset serving to known extensions
    * Remove a possibly undefined requirement in foreman::plugin::discovery
    * Add open_timeout to the report and external node script
    * Add param for timeout to foreman() parser function
    * Allow including foreman::repo standalone

## 7.1.0
* New or changed parameters:
    * Add SSL certificate/key parameters to foreman::plugin::puppetdb
* Other changes and fixes:
    * Disable docroot management in apache::vhost, remove workaround
    * Remove default values from parameter documentation
    * Extended tests for plugin classes

## 7.0.0
* New classes to install Foreman plugins:
    * foreman::plugin::monitoring to install monitoring plugin
    * foreman::plugin::omaha to install Omaha plugin
    * foreman::cli::openscap to install Hammer CLI OpenSCAP plugin
* New or changed parameters:
    * Add db_managed_rake parameter to allow db_manage to be false while still
      managing DB migration/setup by default
    * Add email_config_method parameter to support database configuration of
      email settings with Foreman 1.14+
    * Add version parameter to foreman::cli class to enable updates
* Other changes and fixes:
    * Add environment from agent node YAML to ENC fact upload
    * Use ENC node cache when fact upload fails (GH-492)
    * Configure foreman-tasks plugin from Azure plugin class (GH-480)
    * Fix ordering of Apache service to happen inside foreman::service
    * Fix ordering of Puppet CA generation to Foreman startup (#17133)
    * Fix restarting service on config changes with db_manage disabled (GH-502)
    * Fix incorrect FreeIPA enrollment error on enrolled host
    * Permit extlib 1.x, tftp 2.x
    * Move advanced parameters into new documentation section (#16250)
    * Change parameter documentation to use Puppet 4 style typing
    * Add default parameters for Arch Linux, for ENC support
* Compatibility warnings:
    * Drop support for Ruby 1.8.7
    * If using `db_manage => false`, also set `db_managed_rake` to false if
      managing DB migrations/seed externally

## 6.0.0
* New classes to install Foreman plugins:
    * foreman::plugin::azure to install Azure compute resource plugin
    * foreman::plugin::expire_hosts to install expire hosts plugin
    * foreman::plugin::host_extra_validator to install hostname validator plugin
* New or changed parameters:
    * Add server_port, server_ssl_port parameters to change Apache vhost ports
    * Rename environment parameter to rails_env to fix compatibility with data
      bindings
* Other changes and fixes:
    * node.rb: skip facts upload when facts file is missing, retrieves ENC
      output anyway
    * node.rb: improve logging for empty facts and failed fact uploads
    * Change reports upload to use new config_reports API
    * Change Yum GPG key URLs to HTTPS
    * Fix missing default parameters for strict variables compatibility,
      requiring Puppet 3.7.5 or higher
    * Add SVG images to automatic gzip serving list
    * Move keepalive settings from a template to apache::vhost parameters
    * List Fedora 24 compatibility
* Compatibility warnings:
    * Requires Puppet 3.6 or higher to use the module
    * environment parameter renamed to rails_env
    * Remove Debian 7 (Wheezy) and Ubuntu 12.04 (Precise) support
    * Remove configure_openscap_repo parameter from `foreman::plugin::openscap`
    * Remove rest (v1) smart proxy provider and foreman_api installation
    * Remove `foreman::install::repos` define, use `foreman::repos`
    * Remove `apipie_task` parameter

## 5.2.2
* Fix interpolation of IPA variables in Apache configs (#15642)
* Fix inotify detection of new facts in node.rb watch facts

## 5.2.1
* Fix Apache config includes when VirtualHost priority is changed

## 5.2.0
* New or changed parameters:
    * Add client_ssl_* parameters to control SSL cert used by Foreman to
      communicate with its smart proxies (GH-441)
    * Add puppet_ssldir parameter, supporting new AIO paths and setting the
      `puppetssldir` value in settings.yaml
    * Add keepalive, max_keepalive_requests and keepalive_timeout parameters,
      defaulting to enabled for performance (#8489)
    * Add vhost_priority parameter to control Apache vhost priority (GH-418)
    * Add plugin_version parameter to change ensure property of plugin packages
* Other features:
    * Search for ENC/report configuration in Puppet AIO paths (GH-413)
    * Support report_timeout configuration in report processor
    * Add 'puppetmaster_fqdn' value to ENC facts upload
    * Add foreman::providers class to install type/provider dependencies
    * Document types/providers available in this module
    * Add rest_v3 provider for foreman_smartproxy with minimal dependencies,
      also supplied for AIO (#14455)
* Other changes and fixes:
    * Change apt repository configuration to use puppetlabs-apt 2.x (GH-428)
    * Change configure_scl_repo to true on RHEL for 1.12 compatibility
    * Manage ENC YAML directories, modes and ownership (GH-242)
    * Fix inconsistencies in Yum repos versus foreman-release (GH-388)
    * Fix nil provider error in foreman_config_entry prefetching (GH-420)
    * Fix foreman_smartproxy idempotency for proxy names with spaces (GH-421)
    * Fix foreman_smartproxy to only refresh when currently registered (GH-431)
    * Fix timeout usage warning in ENC under Ruby 2.3 (GH-438)
    * Fix ordering of Puppet server installation before Foreman user (#14942)
    * Fix ordering of foreman::cli after repo setup
    * Change Red Hat name in parameter docs (#14197)
    * Note requirement for en_US.utf8 locale (GH-417)
* Compatibility warnings:
    * `foreman::install::repos` has been moved to `foreman::repos`.
      The old define has been deprecated and will issue a warning.
    * `foreman::compute::openstack` and `foreman::compute::rackspace` default
      to Foreman 1.12 package names, pass `package => 'foreman-compute'` for
      pre-1.12 compatibility.
    * `rest` provider for foreman_smartproxy is deprecated, use rest_v3 or v2
    * `foreman::plugin::openscap` has configure_openscap_repo disabled by
      default, OS repos should now supply dependencies (#14520)

## 5.1.0
* New classes to install Foreman plugins:
    * foreman::plugin::ansible to install Ansible support
    * foreman::plugin::cockpit to install Cockpit support
    * foreman::plugin::memcache to install memcache support
* New or changed parameters:
    * Add puppetrun parameter, allowing you to enable the
      "Run puppet" button (and functionality) on individual host pages
    * Add address and dashboard_address parameters to foreman::plugin::puppetdb
    * Add ssl_certs_dir parameter to control SSLCACertificatePath, disabled by
      default
    * Add serveraliases parameter to manage virtual host aliases
* Other features:
    * Support and test with Puppet 4
    * Add hostgroup provider and type
    * Add filter_result parameter to foreman() search function, to filter out a
      single or set of fields from the results
    * Load OAuth keys in providers from /etc/foreman/settings.yaml if possible
* Other changes and fixes:
    * Support Puppet 3.0 minimum
    * Support Fedora 21, add Ubuntu 16.04
    * Use lower case FQDN to access Foreman smart proxy registration (#8389)
    * Configure PassengerRuby to use foreman-ruby symlink on Debian/Ubuntu
    * Fix key/value splitting in foreman_config_entry resource
    * Fix qualified call to postgresql defined type (GH-386)
    * Fix installation of the JSON package to use ensure_packages
    * Fix installation of remote execution plugin to restart foreman-tasks
* Compatibility warnings:
    * The puppetrun setting is now managed, ensure the parameter is set to true
      if you have already set it to true in the UI.  The default value in the
      params class is "false", and it will override your manual setting in the
      database.
    * Users of the puppetdb class may need to set address/dashboard_address
      parameters, which are now managed and default to "localhost".

## 5.0.2
* Install tasks plugin with remote_execution, chef and salt

## 5.0.1
* Remove fail() from plugin params classes when running on FreeBSD
* Test speed improvements

## 5.0.0
* New or changed parameters:
    * Add package parameter to foreman::plugin::ovirt_provision, puppetdb and
      tasks classes
    * Add plugin_prefix parameter to main class to override package prefixes
    * Removed the configure_ipa_repo parameter
* Other features:
    * Support Puppet master (ENC etc.) setup on FreeBSD
    * Add foreman::plugin::remote_execution class for remote execution plugin
    * Add foreman::plugin::dhcp_browser class for DHCP browser plugin
* Other changes and fixes:
    * Explicitly set permissions on yaml directory
    * Use absolute variables throughout manifests
    * Do not install Passenger packages when passenger parameter is false
    * Change case statement for service management to an if statement
    * Change EL RPM package prefix to 'tfm' for Foreman 1.10
    * Allow newer puppetlabs/apt 2.x module
    * Set PostgreSQL database encoding to UTF-8 (#11681)
    * Move Discovery plugin paramater validation into conditional
    * Set HTTP timeout in ENC script according to timeout setting
    * Prefer Puppet agent SSL CRL for Apache virtualhost configuration
    * Remove cache_data/random_password in favor of puppet/extlib module
    * Add ExportCertData option to Apache SSL virtualhost
    * Fix README typos
* Compatibility warnings:
    * Foreman 1.9 or older users on EL must set additional parameters to
      change package prefixes, see the README.md for details
    * The configure_ipa_repo parameter was removed
    * The cache_data/random_password parser functions were removed

## 4.0.1
* Fix missing brightbox/passenger-legacy PPA on Ubuntu 12.04 (#11069)

## 4.0.0
* New or changed parameters:
    * Add logging_level and loggers parameters to control log config on
      Foreman 1.9+ (#5838)
    * Add email_* parameters to set up email.yml configuration
* Other features:
    * Replace theforeman/concat_native with puppetlabs/concat
    * Add version parameter to foreman::compute::* classes
    * Support foreman::plugin::tasks on Debian
    * Improve smart proxy registration error message (#10466)
* Other changes and fixes:
    * Replace virtual resources in foreman::compute with classes
    * Use foreman-rake console instead of foreman-config, requires 1.7+
    * Fix support for puppetlabs/mysql 3.0
    * Fix websockets_encrypt entry in config file as on/off
    * Remove obsolete entries from settings.yaml
    * Test under future parser

## 3.0.2
* Fix default foreman::plugin::openscap parameter values
* foreman_config_entry: ensure HOME is set on all Puppet versions
* foreman_config_entry: change foreman-config to foreman-rake
* spec fixes for concat_native changes

## 3.0.1
* Fix support for mysql by removing inclusion of mysql class which was removed
  by puppetlabs/mysql in version 3.0.0
* Fix foreman_config_entry checking of dry parameter

## 3.0.0
* New classes to install Foreman plugins:
    * foreman::plugin::abrt to install ABRT support
    * foreman::plugin::digitalocean for DigitalOcean compute resources
    * foreman::plugin::docker for Docker container management
    * foreman::plugin::openscap to install OpenSCAP support
    * foreman::plugin::salt for Salt management support
* New or changed parameters:
    * Add db_pool parameter to control database connection pool size
    * Add manage_user parameter to disable 'foreman' user resource
    * Add server_ssl_crl parameter to change SSL CRL used
    * Add apipie_task parameter for Foreman 1.7 compatibility
    * Add puppet_user/group parameters to foreman::puppetmaster
    * Add timeout parameter to foreman::puppetmaster, increase timeout from
      10 to 60 seconds
    * Add config/config_file parameters to foreman::plugin
    * Add package parameter to foreman::compute::ec2 for Foreman 1.7
      compatibility
    * Rename facts parameter to receive_facts, due to trusted variables
      conflict, an incompatible change (#8944)
    * Changes to foreman::plugin::discovery parameters
    * Remove deprecated passenger_scl parameter, use passenger_ruby and
      passenger_ruby_package instead
* Other features:
    * Add support for Discovery Image 2.0 deployment
    * Add support to deploy Foreman on sub-URI with Passenger by changing
      the foreman_url parameter
    * Configure foreman-plugins repo, remove unused 'rc' repo support (#8880)
    * Enable SSL CRL checking to Foreman virtual host
    * Add additional resource types to foreman() search function (#9155)
* Other changes and fixes:
    * Use pending DB migration/seed flags in Foreman to re-run DB tasks when
      they fail on subsequent runs, requiring Foreman 1.7+ (#4611, #7353)
    * Use puppetlabs/apache 1.2.0 features
    * Improve ENC encoding handling to fix facts uploads from Windows
    * Improve tests with rspec-puppet-facts
    * Improvements for Puppet 4 and future parser support
    * Refreshed README
    * Fix apt-key installation from refreshonly to unless clause
    * Fix dependency on LSB facts (#9449)
    * Fix custom facts error when trying to load ruby-augeas
    * Fix class parameters documentation display in foreman-installer (#6904)
    * Fix mod_lookup_identity concatentation of multiple email addresses
    * Fix hard references to theforeman/puppet in foreman::puppetmaster
    * Fix foreman.yaml path in report processor comment
    * Fix minimum adrien/alternatives version to released 0.3.0
    * Fix spelling error in configure_scl_repo description
    * Fix metadata.json quality issues, pinning dependencies

## 2.3.2
* Refresh db:migrate if DB class changes (#9101)

## 2.3.1
* Ensure Foreman DB settings are initialised before Apache starts to prevent
  race condition (#4611, #7353)
* Remove timeout on apipie:cache rake task (#8381)
* Fix puppetdb_foreman Debian package name

## 2.3.0
* Add foreman_config_entry resource type and provider
* Configure Brightbox Ruby NG PPA on Ubuntu 12.04 (#7227)
    * Set PassengerRuby to ruby1.9.1 and install appropriate Passenger package
    * Keep Ruby alternative on 1.8 via alternatives module dependency (#7970)
* Add foreman::plugin::ovirt_provision class for ovirt_provision_plugin
* Install foreman-release-scl on EL clones (#7234)
* Refacter SSSD facts for faster runs
* Add docs to all classes/defines
* Remove expensive directory recursion on $vardir/yaml
* Deprecated: passenger_scl parameter has been replaced by passenger_ruby and
  passenger_ruby_package

## 2.2.4
* Set GPG keys for each Foreman repo
* Enable EPEL7 GPG checking (#6015)
* Wrap API parameters for new apipie-bindings
* Fix errors with strict variables
* Fix failed status calculation when log processor enabled

## 2.2.3
* Fix apipie-bindings cache path to prevent installer/master conflict
* Sync module configs

## 2.2.2
* Expose Apache vhost ServerName via servername parameter
* Fix dependency on TFTP directory in discovery image download
* Fix apipie-bindings cache directory when HOME is unset in daemon (#7063)
* Unit test and lint fixes

## 2.2.1
* Move ENC and report processor configuration to /etc/puppet/foreman.yaml

## 2.2.0
* Add ipa_authentication parameter to configure Foreman authentication against
  IPA using Kerberos etc (#6445)
* Add foreman::cli class to install and configure Hammer CLI
* Add admin_* parameters for initial admin username and password (Foreman 1.6)
* Add initial_* parameters to create an initial organization or location (#6802)
* Add foreman::plugin::tasks class to install foreman_tasks plugin
* install_images parameter added to foreman::plugin::discovery to download
  discovery images to TFTP root
* Change ENC and report processor configuration to /etc/foreman/puppet.yaml
  instead of embedded and templated settings
* Add foreman_smartproxy provider that uses apipie-bindings, adds a timeout
  parameter
* Configure websockets_ssl* in Foreman settings (#3601)
* Purge configuration files under Foreman httpd directories
* Extend startup timeout for Passenger, add parameters to control
* Refresh proxy features when foreman_smartproxy is notified (#3185)
* Fix future parser compatibility in random_password() and manifests
* Add Windows and SUSE to params class
* Remove v1 node and report processors
* Remove workaround for passenger.conf being replaced by pl-apache
* Refactor foreman::config::enc into foreman::puppetmaster

## 2.1.4
* Report processor: increment error counter for non-resource Puppet
  errors (#3851)

## 2.1.3
* Fix ordering of Apache and foreman_smartproxy resources
* Workaround Travis CI/REE issue

## 2.1.2
* Fix user shell path so it's valid on Debian (#5390)
* Remove obsolete test conditional for Facter 2 compat

## 2.1.1
* Fix SSL configuration with upper case hostnames (#4679)

## 2.1.0
* Add compute resource and new plugin classes (#3308)
* Add support for parallel fact pushes in node.rb
* Add event driven fact pushing (--watch-facts) in node.rb
* Add server_ssl_chain parameter to set SSLCertificateChainFile
* Add support for plugins to add virtual host entries
* Use alphanumeric ordering for vhosts (#4225)
* Use the production CentOS SCL repo, use centos-release-SCL
* Add Debian plugins repo
* Update to puppetlabs-apache 1.0
* Trigger db:seed too when DB changes
* Run foreman-rake apipie:cache after installation
* Ensure plugins are installed after core
* Improve node.rb response when server-side error occurs
* Remove template source from header for Puppet 3.5 compatibility
* Add basic Archlinux support for agent classes
* Fix Modulefile specification for Forge compatibility
* Cleanup of foreman::config

## 2.0.1
* Bump stdlib dependency to fix Forge upload error

## 2.0.0
* Add Foreman 1.4 support (default)
* Switch to puppetlabs-apache from theforeman-apache
* Switch to puppetlabs-postgresql version 3+
* Add foreman::plugin define and classes
* Set far-future expires headers for web UI assets
* Add db:seed support after db:migrate
* Add EPEL and SCL yum repository configuration
* Add $server_ssl_* parameters to configure vhost SSL certs
* Set PostgreSQL DB owner to foreman for db:drop support
* Create cache file properly to prevent re-sending of fact files (node.rb)
* Add support for running node.rb as a different user
* Skip empty host fact files (node.rb)
* Fix running DB migrations for SQLite
* Fix JSON package name on Debian 6 (Squeeze)
* Fix proxy registration under foreman_api 0.1.18+
* Only chown files in cache_data if puppet user exists
* Quote database passwords in database.yml
* Updated foreman() parser function instructions
* Move passenger restart to foreman::service class
* Drop Puppet 3.0 and 3.1 tests
* Update tests for rspec-puppet 1.0.0
