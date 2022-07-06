define sudo::do_stig_mods {
  augeas { "Apply STIG to ${name}":
    incl    =>  "${name}",
    lens    =>  'sudoers.lns',
    changes =>  [
                'rm Defaults[*]/authenticate/negate',
                'setm spec[*]/host_group/command[*]/tag[.="NOPASSWD"] . "PASSWD"',
                ],
  } 
}
