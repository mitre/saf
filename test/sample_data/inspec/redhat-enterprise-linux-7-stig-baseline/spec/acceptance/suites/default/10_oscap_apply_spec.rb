# -*- encoding : utf-8 -*-
require 'spec_helper_acceptance'
require 'json'

test_name 'Remediate via SSG'

# Disclaimer:
#
# This is for something to test the policies against while testing
#
# The remediations in the SSG are almost certainly going to be different from
# those in the SIMP framework since SIMP is built as a composable system and
# not a monolithic 'lockdown'.
#
describe 'Use the SCAP Security Guide to remediate the system' do
  hosts.each do |host|
    context "on #{host}" do
      before(:all) do
        @os_str = fact_on(host, 'operatingsystem') + ' ' + fact_on(host, 'operatingsystemrelease')

        @ssg_supported = true

        begin
          @ssg = Simp::BeakerHelpers::SSG.new(host)
        rescue
          @ssg_supported = false
        end
      end

      it 'should remediate the system against the SSG' do

        pending("SSG support for #{@os_str}") unless @ssg_supported

        # Were accepting all exit codes here because there have occasionally been
        # failures in the SSG content and we're not testing that.

        @ssg.remediate(%(xccdf_org.ssgproject.content_profile_stig))
      end
    end
  end
end
