define pam::limits_fragment (
  $shortname   = undef,
  $set_comment = undef,
  $mode        = undef,
) {
  include pam
  $parts = split($name,':')
  $domain = $parts[0]
  $type = $parts[1]
  $item = $parts[2]
  $value = $parts[3]
  $msg = "THIS OPTION [$domain(${item}:${type})] IS MANAGED BY PUPPET - DO NOT MODIFY!!"
  $confd_dir = $pam::limits_confd_dir

  $file_mode = $mode ? {
    undef   =>  $pam::limits_file_mode,
    default =>  $mode,
  }

  $limits_file = $shortname ? {
    undef   =>  "$pam::limits_conf_file",
    default =>  "${confd_dir}/${shortname}.conf",
  }

  $comment = $set_comment ? {
    undef   =>  $pam::set_comments,
    default =>  $set_comment,
  }
  validate_bool($comment)

  $file_props = {ensure => file, owner => 'root', group => 'root', mode => $file_mode, require => File["${confd_dir}"]}
  ensure_resource('file',"${limits_file}",$file_props)

  if !$shortname and $value{
    # The default limits.conf file has a comment at the end
    # "End of file". We will attempt to retain this comment
    # and place all of our added settings above it. We will ensure
    # that this comment exists so that the remainder of our logic
    # works as expected.
    augeas { "Ensure end-of-file for ${domain}:${item}:${type} in ${limits_file}":
      incl    =>  "${limits_file}",
      lens    =>  'limits.lns',
      changes =>  'set #comment[.="End of file"] "End of file"',
    } ->
    # Now we create the rule if it doesn't exist
    augeas { "Add ${domain}:${item}:${type} to ${limits_file}":
      incl    =>  "${limits_file}",
      lens    =>  'limits.lns',
      changes =>  [
                  "ins domain before #comment[.='End of file']",
                  "set domain[following-sibling::*[1][label()='#comment'][.='End of file']] \"$domain\"",
                  "set domain[following-sibling::*[1][label()='#comment'][.='End of file']]/type \"$type\"",
                  "set domain[following-sibling::*[1][label()='#comment'][.='End of file']]/item \"$item\"",
                  "set domain[following-sibling::*[1][label()='#comment'][.='End of file']]/value \"$value\"",
                  ],
      onlyif  =>  "match domain[.=\"$domain\"][type=\"$type\"][item=\"$item\"][value=\"$value\"] size == 0",
      before  =>  Augeas["Ensure ${domain}:${item}:${type} to ${limits_file}"],
    } 
  }

  if $value {
    # Now we ensure that the rule stays as intended
    augeas { "Ensure ${domain}:${item}:${type} to ${limits_file}":
      incl    =>  "${limits_file}",
      lens    =>  'limits.lns',
      changes =>  [
                  "rm domain[.=\"$domain\"][type=\"$type\"][item=\"$item\"]",
                  "set domain[last()+1] \"$domain\"",
                  "set domain[last()]/type \"$type\"",
                  "set domain[last()]/item \"$item\"",
                  "set domain[last()]/value \"$value\"",
                  ],
      onlyif  =>  "match domain[.=\"$domain\"][type=\"$type\"][item=\"$item\"][value=\"$value\"] size == 0",
    } 
  
    if $comment {
      # Finally we add a Puppet managed comment to the item
      augeas { "Set comment for ${domain}:${item}:${type} in ${limits_file}":
        incl    =>  "${limits_file}",
        lens    =>  'limits.lns',
        changes =>  [
                    "ins #comment before domain[.=\"$domain\"][type=\"$type\"][item=\"$item\"][value=\"$value\"]",
                    "set #comment[following-sibling::*[1][.=\"$domain\"][type=\"$type\"][item=\"$item\"][value=\"$value\"]] \"$msg\"",
                    ],
        onlyif  =>  "match #comment[.=\"$msg\"] size == 0",
        require =>  Augeas["Ensure ${domain}:${item}:${type} to ${limits_file}"],
      }
    } else {
      #Remove comment if requested
      augeas { "Remove comment for ${domain}:${item}:${type} in ${limits_file}":
        incl    =>  "${limits_file}",
        lens    =>  'limits.lns',
        changes =>  "rm #comment[.=\"${msg}\"]",
        require =>  Augeas["Ensure ${domain}:${item}:${type} to ${limits_file}"],
      }
    }
  } else {
    augeas { "Remove ${domain}:${item}:${type} from ${limits_file}":
      incl    =>  "${limits_file}",
      lens    =>  'limits.lns',
      changes =>  [
                  "rm domain[.=\"${domain}\"][type=\"$type\"][item=\"$item\"]",
                  "rm #comment[.=\"${msg}\"]",
                  ],
      #onlyif  =>  "match domain[.=\"${domain}\"][type=\"$type\"][item=\"$item\"] size != 0",
    }
  }
}
