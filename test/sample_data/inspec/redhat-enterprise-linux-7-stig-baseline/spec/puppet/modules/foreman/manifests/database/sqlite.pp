# Set up the foreman database using sqlite
class foreman::database::sqlite {
  exec { 'create':
    command => '/usr/sbin/foreman-rake db:create',
    creates => "${::foreman::app_root}/db/production.sqlite3",
  }
}
