# Type is declared by user name and requires hash 'user_data' that is also
# keyed by user names.  The user_data hash must contain a hash of file names
# with content and any other file attributes that will be created in the
# respective user home directories.
#
# To distribute binary files, convert the file to base64 and prefix it with
# 'BASE64:' in the 'content' value.
#
# Hiera example to manage '.k5users' for the root user:
#--------------------------------------------------------------
# users::user_files::user_data:
#   root:
#     '.k5users':
#       content: |
#         southalc@OMA.SPAWAR.NAVY.MIL
#         kimmell@OMA.SPAWAR.NAVY.MIL

define users::user_files (
  $user_data    = {},
) {
  $user         = $name

  if has_key($user_data, $user) {
    $local_users_hash = merge(parsejson($::local_user_info), parsejson($::system_user_info))
    $home         = $local_users_hash[$user]['home']
    $user_files   = prefix($user_data[$user],"${home}/")
    $file_names = keys($user_files)

    users::user_files::files { $file_names:
      user        => $user,
      file_data   => $user_files,
    }

  }
}

