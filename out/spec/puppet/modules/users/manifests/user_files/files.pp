# Defined type is declared by fully qualified file names.  Use the
# "users::user_files" type to prepend user home directories onto a
# hash of unqualified file names to be created in each user's $HOME.
#
# Parameters
#  'user' - The user who will own the target file
#
#  'file_data' - Hash of fully qualified file names with valid file attributes
#
define users::user_files::files (
  $user,
  $file_data = {},
) {

  $file = $file_data[$name]

  # If file content prefixed with 'BASE64:' decode content
  if $file['content'] =~ /^BASE64:(.+)/ {
    $base64 = split($file['content'], ':')
    $b64_hash = merge($file, { 'content' => base64(decode, $base64[1])})
    $file_hash = { "$name" => $b64_hash }
  }
  else {
    $file_hash = { "$name" => $file }
  }

  # Set defaults if not included in the hash
  $local_users_hash = merge(parsejson($::local_user_info), parsejson($::system_user_info))
  $group            = $local_users_hash[$user]['group']

  $defaults =  {
        path  => $name,
        owner => $user,
        group => $group,
        mode  => '0600',
  }

  create_resources(file, $file_hash, $defaults)
}

