# Installs foreman_ansible plugin
class foreman::plugin::ansible {

  include ::foreman::plugin::tasks

  foreman::plugin {'ansible':
    notify => Service['foreman-tasks'],
  }
}
