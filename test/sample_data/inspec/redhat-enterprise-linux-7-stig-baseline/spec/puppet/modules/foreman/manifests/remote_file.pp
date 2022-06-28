# Downloads a file from a URL to a local file given by the title
define foreman::remote_file($remote_location, $mode='0644') {
  exec {"retrieve_${title}":
    command => "/usr/bin/curl -s ${remote_location} -o ${title}",
    creates => $title,
    timeout => 0,
  }

  file {$title:
    mode    => $mode,
    require => Exec["retrieve_${title}"],
  }
}
