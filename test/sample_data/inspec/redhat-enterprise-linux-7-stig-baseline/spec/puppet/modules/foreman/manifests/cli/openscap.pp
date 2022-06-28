# = Hammer OpenSCAP plugin
#
# This installs the OpenSCAP plugin for Hammer CLI
#
# === Parameters:
#
class foreman::cli::openscap {
  package { "${::foreman::cli::hammer_plugin_prefix}foreman_openscap":
    ensure => installed,
  }
}
