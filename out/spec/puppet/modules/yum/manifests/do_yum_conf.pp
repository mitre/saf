define yum::do_yum_conf ( $file, $lens, $context=undef, $set_comment=true ) {
  $opt_val=split($name,':')
  $option=$opt_val[0]
  $value=$opt_val[1]
  $path_comps=split($option,'/')
  $base_path=$path_comps[0]
  $msg="THIS OPTION ($base_path) IS MANAGED BY PUPPET - DO NOT MODIFY!!"
  $footer="PUT YOUR REPOS HERE OR IN separate files named file.repo"

  if ! $context {
    $bcontext="${file}"
  } else {
    $bcontext="${context}"
  }

  augeas { "Insert $option if doesn't exist":
    incl    =>  "$file",
    context =>  "/files/$bcontext",
    lens    =>  "$lens",
    changes =>  [
                "defnode node1 #comment[.=~regexp(\"^[ \t]*$footer.*\")] \"$footer\"",
                "ins $base_path before \$node1[1]",
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
      require =>  Augeas["Set $option in $file"],
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
