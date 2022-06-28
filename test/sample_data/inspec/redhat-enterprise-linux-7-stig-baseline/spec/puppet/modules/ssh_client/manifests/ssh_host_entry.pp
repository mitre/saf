define ssh_client::ssh_host_entry (
  $options      = {},
  $remove_opts  = [],
  $host_action  = 'modify',
  $lens         = 'ssh.lns',
  $set_comment  = undef,
  $ins_before   = undef,
) {
  include ssh_client
  $file = $ssh_client::ssh_client_config
  if $set_comment {
    $sc = $set_comment
  } else {
    $sc = $ssh_client::set_comments
  } 
  $opt_context = "${file}/Host[.='${name}']"

  validate_bool($sc)
  validate_hash($options)
  validate_array($remove_opts)
  validate_re($host_action, ["^modify$","^remove$"])

  if $host_action == 'modify' {
    # Ensure Host entry exists
    augeas { "Ensuring Host entry exists: ${name}":
      incl        =>  "$file",
      lens        =>  "$lens",
      changes     =>  "set Host[.='${name}'] '${name}'",
      require     =>  File["$file"],
    }

    # Move the node if required
    if $ins_before {
      augeas { "Moving Host[${name}] before Host[${ins_before}]":
        incl        =>  "$file",
        lens        =>  "$lens",
        changes     =>  [
                        "ins Host before Host[.='${ins_before}']",
                        "set Host[following-sibling::*[1][.='${ins_before}']] 'tmp_host_AxweT'",
                        "mv Host[.='${name}'] Host[.='tmp_host_AxweT']",
                        ],
        require     =>  Augeas["Ensuring Host entry exists: ${name}"],
        onlyif      =>  "match Host[.='${name}'][preceding-sibling::*[label()='Host'][.='${ins_before}']] size > 0",
      }
    }

    $settings = join_keys_to_values($options,':')

    ssh_client::do_simple_vars{ $settings: 
      file         =>  "$file",
      context      =>  "${opt_context}",
      lens         =>  "$lens",
      set_comment  =>  $sc,
      require      =>  File["$file"],
    } 
    do_removes { $remove_opts:
      con     =>  "${opt_context}",
      lens    =>  "${lens}",
      file    =>  "${file}",
    }
  } else {
    augeas { "Remove Host entry: ${name}":
      incl        =>  "$file",
      lens        =>  "$lens",
      changes     =>  "rm Host[.='${name}']",
      require     =>  File["$file"],
    }
  }
}

define do_removes ($con, $lens, $file) {
  augeas { "Removing option \"${name}\" from ${con}":
    incl        =>  "${file}",
    lens        =>  "${lens}",
    context     =>  "/files/${con}",
    changes     =>  [
                    "rm #comment[.=~regexp('^.*${name}.*$')]",
                    "rm ${name}",
                    ],
  }
}
