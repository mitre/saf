# Install a yum repo
define foreman::repos::yum ($repo, $yumcode, $gpgcheck) {
  $repo_path = $repo ? {
    'stable'      => 'releases/latest',
    /^releases\// => $repo,
    'nightly'     => $repo,
    default       => "releases/${repo}",
  }
  $plugins_repo_path = $repo ? {
    'stable'      => 'plugins/latest',
    /^releases\// => regsubst($repo, '^release/(.*?)', 'plugins/\1'),
    default       => "plugins/${repo}",
  }
  $gpgcheck_enabled_default = $gpgcheck ? {
    false   => '0',
    default => '1',
  }
  $gpgcheck_enabled = $repo ? {
    'nightly' => '0',
    default   => $gpgcheck_enabled_default,
  }
  yumrepo { $name:
    descr    => "Foreman ${repo}",
    baseurl  => "http://yum.theforeman.org/${repo_path}/${yumcode}/\$basearch",
    gpgcheck => $gpgcheck_enabled,
    gpgkey   => "https://yum.theforeman.org/${repo_path}/RPM-GPG-KEY-foreman",
    enabled  => '1',
  }
  yumrepo { "${name}-source":
    descr    => "Foreman ${repo} - source",
    baseurl  => "http://yum.theforeman.org/${repo_path}/${yumcode}/source",
    gpgcheck => $gpgcheck_enabled,
    gpgkey   => "https://yum.theforeman.org/${repo_path}/RPM-GPG-KEY-foreman",
    enabled  => '0',
  }
  yumrepo { "${name}-plugins":
    descr    => "Foreman plugins ${repo}",
    baseurl  => "http://yum.theforeman.org/${plugins_repo_path}/${yumcode}/\$basearch",
    gpgcheck => '0',
    enabled  => '1',
  }
  yumrepo { "${name}-plugins-source":
    descr    => "Foreman plugins ${repo} - source",
    baseurl  => "http://yum.theforeman.org/${plugins_repo_path}/${yumcode}/source",
    gpgcheck => '0',
    enabled  => '0',
  }
}
