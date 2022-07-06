# == Class: issue
#
# This super-basic module deploys the system banner (issue). If custom
# content is provided it is used in the file. Otherwise some default
# content is used. The module also provides the DISA STIG mandated
# message if requested. When STIG is requested this banner will always
# be preferred over any provided custom content.
#
# === Parameters
#
# [*content*]
#   Custom content to be used in the issue file (banner). Generally,
#   escape characters are accepted.
#
# [*issue_file*]
#   The OS-specific location of the banner configuration file.
#
# === Variables
#
# None
#
# === Examples
#
#  class { 'issue':
#    servers => [ 'pool.ntp.org', 'ntp.local.company.com' ],
#  }
#
# === Authors
#
# Author Lesley Kimmel <lesley.j.kimmel@gmail.com>
#
# === Copyright
#
# Copyright 2017 Lesley Kimmel, unless otherwise noted.
#
class issue (
  $content     = $issue::params::content,
  $issue_file  = $issue::params::issue_file,
) inherits issue::params {
  validate_string($content)

  file { "$issue_file":
    ensure  =>  file,
    owner   =>  'root',
    group   =>  'root',
    mode    =>  "0644",
    content =>  $content,
  }
}
