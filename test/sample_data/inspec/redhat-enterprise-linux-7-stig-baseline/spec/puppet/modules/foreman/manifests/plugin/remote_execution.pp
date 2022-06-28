# Installs foreman_remote_execution plugin
class foreman::plugin::remote_execution {

  include ::foreman::plugin::tasks

  foreman::plugin {'remote_execution':
    notify => Service['foreman-tasks'],
  }
}
