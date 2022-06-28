define add_ipv6::do_simple_vars ( $file, $lens, $context=undef ) {
  $opt_val=split($name,'\|')
  $option=$opt_val[0]
  $value=$opt_val[1]
  $path_comps=split($option,'/')
  $base_path=$path_comps[0]

  if ! $context {
    $bcontext=$file
  } else {
    $bcontext=$context
  }

  augeas { "Set ${option} in ${file}":
    incl    =>  $file,
    context =>  "/files/${bcontext}",
    lens    =>  $lens,
    changes =>  "set ${option} ${value}",
  }
}
