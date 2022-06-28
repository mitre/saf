#!/usr/bin/rake -T

require 'simp/rake'
require 'simp/rake/beaker'
require 'simp/rake/fixtures'
require 'kitchen/rake_tasks'

Simp::Rake::Beaker.new( File.dirname(__FILE__))

unless ENV['TRAVIS']
  Kitchen::RakeTasks.new()
end

namespace :profile do
  desc <<-EOM
    Run 'inspec check' on all profiles
  EOM
  task :check do
    sh %(inspec check . --chef-license=accept)
  end
end
