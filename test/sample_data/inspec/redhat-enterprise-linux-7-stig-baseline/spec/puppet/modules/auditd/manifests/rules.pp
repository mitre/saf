define auditd::rules (
  $header   =  undef,
  $priority = 10,
  $content  = undef,
  $rules    = [],
) {
  include ::auditd

  validate_array($rules)

  if $content {
    validate_string($content)
  } elsif size($rules) < 0 {
    fail("This type requires either \$content string or list (array) of \$rules ($name)")
  }

  if $auditd::use_augenrules {
    file { "$auditd::auditd_rulesd_dir/${priority}-${name}.rules":
      ensure  =>  file,
      mode    =>  "0600",
      content =>  template('auditd/file_fragment.erb'),
      notify  =>  Service["$auditd::service_name"],
    }
  } else {
    concat::fragment { "$auditd::auditd_rules_file ${priority}-${name}":
      target  =>  "$auditd::auditd_rules_file",
      content =>  template('auditd/file_fragment.erb'),
      order   =>  $priority,
    }
  }
}
