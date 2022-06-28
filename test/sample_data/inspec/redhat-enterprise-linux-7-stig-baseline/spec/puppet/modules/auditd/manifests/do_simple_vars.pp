define auditd::do_simple_vars ( $file, $lens, $context=undef, $set_comment=true ) {
  validate_bool($set_comment)
  $opt_val=split($name,':')
  $option=$opt_val[0]
  $value=$opt_val[1]
  $path_comps=split($option,'/')
  $base_path=$path_comps[0]
  $msg="THIS OPTION ($base_path) IS MANAGED BY PUPPET - DO NOT MODIFY!!"

  if ! $context {
    $bcontext="${file}"
  } else {
    $bcontext="${context}"
  }

  augeas { "Insert $option after comment":
    incl    =>  "$file",
    context =>  "/files/$bcontext",
    lens    =>  "$lens",
    changes =>  [
                "defnode node1 #comment[.=~regexp(\"^[ \t]*$base_path.*\")] \"$base_path\"",
                "ins $base_path after \$node1[1]",
                "set $option $value",
                ],
    onlyif  =>  "match $base_path size == 0",
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
                  "ins #comment before $base_path",
                  "set #comment[following-sibling::*[1][label()=\"$base_path\"]] \"$msg\"",
                  ],
      onlyif  =>  "match #comment[.=\"$msg\"] size == 0",
      require =>  Augeas["Insert $option after comment"],
    }
  } else {
    augeas { "Set comment for $option in $file":
      incl    =>  "$file",
      context =>  "/files/$bcontext",
      lens    =>  "$lens",
      changes =>  "rm #comment[.=\"$msg\"]",
    }
  }
}
