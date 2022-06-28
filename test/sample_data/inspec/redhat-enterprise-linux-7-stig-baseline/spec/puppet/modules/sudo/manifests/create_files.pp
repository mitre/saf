define sudo::create_files ( $lines, $general_file_settings=undef ) {
  include sssd
  validate_array($lines)
  if !$general_file_settings {
    $base_file_settings=$sudo::file_defaults
  } else {
    $base_file_settings=$general_file_settings
  }

  $file_specific_settings = {
                            'path'         => "${sudo::sudoersd_dir}/${name}",
                            'content'      => template('sudo/sudoers.erb'),
                            'validate_cmd' => "$sudo::validate_cmd",
                            'require'      => Package["$sudo::sudo_pkg"],
                            }
  $file_object_hash = { "${sudo::sudoersd_dir}/${name}" => $file_specific_settings }
  create_resources('file',$file_object_hash,$base_file_settings)

  if !member($sudo::stig_exclude,$name) {
    notify { "STIG Warning - ${name}":
      message   =>  "[WARNING] File resource \'${sudo::sudoersd_dir}/${name}\' is being managed by Puppet but\nis also eligible for STIG. This may cause constant changes and an unpredictable state.\nEnsure that your file meets STIG or add the file to the 'stig_exclude' list.",
    }
  }
}
