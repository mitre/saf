# Installs foreman_salt plugin
class foreman::plugin::salt {

  include ::foreman::plugin::tasks

  foreman::plugin {'salt':
  }
}
