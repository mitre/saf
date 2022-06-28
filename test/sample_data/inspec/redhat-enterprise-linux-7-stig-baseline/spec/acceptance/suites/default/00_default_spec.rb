# -*- encoding : utf-8 -*-
require 'spec_helper_acceptance'
require 'json'

test_name 'Validate Inspec'

describe 'pre-check the inspec content' do

  profiles_to_validate = ['disa_stig']

  hosts.each do |host|
    profiles_to_validate.each do |profile|
      context "for profile #{profile}" do
        context "on #{host}" do
          profile_path = File.join(
                fixtures_path,
                'inspec_profiles',
                "#{fact_on(host, 'operatingsystem')}-#{fact_on(host, 'operatingsystemmajrelease')}-#{profile}"
              )

          unless File.exist?(profile_path)
            it 'should run inspec' do
              skip("No matching profile available at #{profile_path}")
            end
          else
            before(:all) do
              @inspec = Simp::BeakerHelpers::Inspec.new(host, profile)
            end

            it 'should run inspec' do
              @inspec.run
            end

            it 'should have an inspec report' do
              inspec_report = @inspec.process_inspec_results

              if inspec_report[:failed] > 0
                puts inspec_report[:report]
              end
            end
          end
        end
      end
    end
  end
end
