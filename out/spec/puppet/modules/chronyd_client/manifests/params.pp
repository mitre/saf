class chronyd_client::params {
  case $::osfamily {
    'RedHat': {
      $conf_file = '/etc/chrony.conf'
      $pkg_name = 'chrony'
      $svc_name = 'chronyd'
      $keyfile = '/etc/chrony.keys'
      $server_opt_defaults    = {
                                'version'             =>  '4',
                                'iburst'              =>  true,
                                }
      $client_config_defaults = {
                                'stratumweight'       =>  '0',
                                'bindcmdaddress'      =>  ['127.0.0.1','::1'],
                                'keyfile'             =>  '/etc/chrony.keys',
                                'noclientlog'         =>  true,
                                'logchange'           =>  '0.5',
                                'logdir'              =>  '/var/log/chrony',
                                }
      $minimal_configs        = {
                                'driftfile'           =>  '/var/lib/chrony/drift',
                                'makestep'            =>  '1.0 3',
                                'rtcsync'             =>  true,
                                }
      $valid_opts             = [
                                'bindacqaddress',
                                'bindcmdaddress',
                                'cmdallow',
                                'cmddeny',
                                'cmdport',
                                'combinelimit',
                                'corrtimeratio',
                                'driftfile',
                                'dumpdir',
                                'dumponexit',
                                'fallbackdrift',
                                'hwclockfile',
                                'include',
                                'initstepslew',
                                'keyfile',
                                'logchange',
                                'logdir',
                                'mailonchange',
                                'makestep',
                                'manual',
                                'maxchange',
                                'maxsamples',
                                'maxslewrate',
                                'maxupdateskew',
                                'minsamples',
                                'minsources',
                                'pool',
                                'reselectdist',
                                'rtcsync',
                                'sched_priority',
                                'stratumweight',
                                ]
      $valid_server_opts      = [
                                'port',
                                'minpoll',
                                'maxpoll',
                                'maxdelay',
                                'maxdelayratio',
                                'maxdelaydevratio',
                                'presend',
                                'key',
                                'offline',
                                'auto_offline',
                                'iburst',
                                'minstratum',
                                'polltarget',
                                'version',
                                'prefer',
                                'noselect',
                                'minsamples',
                                'maxsamples',
                                ]
    }
  }
}
