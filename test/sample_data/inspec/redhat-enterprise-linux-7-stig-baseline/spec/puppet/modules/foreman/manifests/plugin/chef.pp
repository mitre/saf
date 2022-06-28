# Installs foreman_chef plugin
class foreman::plugin::chef {

  include ::foreman::plugin::tasks

  foreman::plugin {'chef':
  }
}
