class vmware_gugent::execute {
  exec { "Launching gugent agent":
    command =>  "${vmware_gugent::install_path}/vrm-agentd ${vmware_gugent::install_path}",
  }
}
