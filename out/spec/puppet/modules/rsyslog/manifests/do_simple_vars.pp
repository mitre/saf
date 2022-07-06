define rsyslog::do_simple_vars ( $file, $lens, $context=undef, $set_comment=true ) {
  validate_bool($set_comment)
  $opt_val=split($name,':')
  $option=$opt_val[0]
  $option_esc=shell_escape($option)
  $value=$opt_val[1]
  $path_comps=split($option,'/')
  $base_path=$path_comps[0]
  $base_path_esc=shell_escape($base_path)
  $multi_value_list = $rsyslog::multi_value_list
  $msg="THIS OPTION ($base_path) IS MANAGED BY PUPPET - DO NOT MODIFY!!"

  if ! $context {
    $bcontext="${file}"
  } else {
    $bcontext="${context}"
  }

  if member($multi_value_list, $option) {
    $msg1="THIS OPTION ($base_path $value) IS MANAGED BY PUPPET - DO NOT MODIFY!!"
    augeas { "Insert $option $value after comment":
      incl    =>  "$file",
      context =>  "/files/$bcontext",
      lens    =>  "$lens",
      changes =>  [
                  "defnode node1 #comment[.=~regexp(\"^[ \t]*$base_path[ \t]*$value.*\")] \"$base_path $value\"",
                  "ins $base_path after \$node1[1]",
                  "set *[label()=\"$base_path\"][.=\"\"] $value",
                  ],
      onlyif  =>  "match $base_path_esc[.=\"$value\"] size==0",
    } ->
    augeas { "Set $option $value in $file":
      incl    =>  "$file",
      context =>  "/files/$bcontext",
      lens    =>  "$lens",
      changes =>  "set $option_esc[.=\"$value\"] $value",
    } 

    if $set_comment {
      augeas { "Set comment for $option in $file":
        incl    =>  "$file",
        context =>  "/files/$bcontext",
        lens    =>  "$lens",
        changes =>  [
                    "ins #comment before $base_path_esc[.=\"$value\"]",
                    "set #comment[following-sibling::*[1][label()=\"$base_path\"][.=\"$value\"]] \"$msg1\"",
                    ],
        onlyif  =>  "match #comment[.=\"$msg1\"] size == 0",
        require =>  Augeas["Set $option $value in $file"],
      }
    } else {
      augeas { "Remove comment for $option $value in $file":
        incl    =>  "$file",
        context =>  "/files/$bcontext",
        lens    =>  "$lens",
        changes =>  "rm #comment[.=\"$msg1\"]",
      }
    }
  } else {
    augeas { "Insert $option after comment":
      incl    =>  "$file",
      context =>  "/files/$bcontext",
      lens    =>  "$lens",
      changes =>  [
                  "defnode node1 #comment[.=~regexp(\"^[ \t]*$base_path.*\")] \"$base_path\"",
                  "ins $base_path after \$node1[1]",
                  "set $option_esc $value",
                  ],
      onlyif  =>  "match $base_path_esc size==0",
    } ->
    augeas { "Set $option in $file":
      incl    =>  "$file",
      context =>  "/files/$bcontext",
      lens    =>  "$lens",
      changes =>  "set $option $value",
    } 

    if $set_comment {
      augeas { "Set comment for $option in $file":
        incl    =>  "$file",
        context =>  "/files/$bcontext",
        lens    =>  "$lens",
        changes =>  [
                    "ins #comment before $base_path_esc",
                    "set #comment[following-sibling::*[1][label()=\"$base_path\"]] \"$msg\"",
                    ],
        onlyif  =>  "match #comment[.=\"$msg\"] size == 0",
        require =>  Augeas["Set $option in $file"],
      }
    } else {
      augeas { "Remove comment for $option in $file":
        incl    =>  "$file",
        context =>  "/files/$bcontext",
        lens    =>  "$lens",
        changes =>  "rm #comment[.=\"$msg\"]",
      }
    }
  }
}
