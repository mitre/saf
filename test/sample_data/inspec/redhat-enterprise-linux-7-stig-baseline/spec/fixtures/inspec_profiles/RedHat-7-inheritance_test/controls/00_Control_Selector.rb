# -*- encoding : utf-8 -*-
require_controls 'disa_stig-el7' do
  @conf['profile'].info[:controls].each do |ctrl|
    tags = ctrl[:tags]
    if tags && tags[:subsystems]
      unless tags[:subsystems].empty?
        control ctrl[:id]
      end
    end
  end
end
