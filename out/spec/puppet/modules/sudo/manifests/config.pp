class sudo::config {
  file { "$sudo::sudoersd_dir":
    ensure    =>  directory,
    recurse   =>  true,
    purge     =>  $sudo::purge_sudoersd,
    ignore    =>  $sudo::purge_exclude,
    require   =>  Package["$sudo::sudo_pkg"],
  }

  create_resources(sudo::create_files, $sudo::custom_settings)

  if $sudo::stig_enabled {
    if !$sudo::exclude_sudoers {
      sudo::do_stig_mods { "$sudo::sudoers_file": }
    }

    if $::sudoersd_files != 'NONE' {
      $all_sudoersd_files = split($::sudoersd_files,',')
      $tmp_sudoersd_files = delete($all_sudoersd_files,$sudo::stig_exclude)
      $stig_sudoersd_files = prefix($tmp_sudoersd_files,"${sudo::sudoersd_dir}/")

      sudo::do_stig_mods { $stig_sudoersd_files: }
    }

  }
}
