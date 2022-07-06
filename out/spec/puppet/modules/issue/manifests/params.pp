class issue::params {
  case $::osfamily {
    'RedHat': {
        $issue_file = '/etc/issue'
        $content    = "\\S\nKernel \\r on an \\m"
    }
  }
}
