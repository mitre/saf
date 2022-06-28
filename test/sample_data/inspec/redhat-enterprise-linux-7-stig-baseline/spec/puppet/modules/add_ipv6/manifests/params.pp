class add_ipv6::params {
  case $::osfamily {
    'RedHat': {
      $ifcfg_base = '/etc/sysconfig/network-scripts/ifcfg-'
      $lens = 'shellvars.lns'
      $ipv6_base_settings     = {
                                'IPV6INIT'            =>  'yes',
                                'IPV6_AUTOCONF'       =>  'no',
                                'IPV6_PEERROUTES'     =>  'no',
                                'IPV6_FAILURE_FATAL'  =>  'no',
                                'IPV6_PEERDNS'        =>  'no',
                                'IPV6_DEFROUTE'       =>  'no',
                                }
      $ipv6_primary_settings  = {
                                'IPV6_DEFROUTE'       =>  'yes',
                                }
    }
  }
}
