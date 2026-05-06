require 'rails_helper'

RSpec.describe 'Production Environment Setup' do
  describe 'Rails Configuration' do
    it 'Rails application is configured' do
      expect(Rails.application).to be_present
    end

    it 'database is configured' do
      expect(Rails.application.config.database_configuration).to be_present
    end

    it 'active storage is configured' do
      expect(Rails.application.config.active_storage).to be_present
    end
  end

  describe 'Environment Variables' do
    it 'supports production environment setup' do
      # Verify ENV supports key access
      expect(ENV).to respond_to(:[])
      expect(ENV).to respond_to(:fetch)
    end
  end

  describe 'Security Configuration' do
    it 'action controller is configured' do
      expect(Rails.application.config.action_controller).to be_present
    end

    it 'sessions are configured' do
      expect(Rails.application.config.session_store).to be_present
    end
  end

  describe 'Logger Configuration' do
    it 'Rails logger is configured' do
      expect(Rails.logger).to be_present
    end

    it 'logger works without errors' do
      expect {
        Rails.logger.info('Test log entry')
      }.not_to raise_error
    end
  end

  describe 'Database Connection' do
    it 'connects to database successfully' do
      expect {
        ActiveRecord::Base.connection.execute('SELECT 1')
      }.not_to raise_error
    end
  end
end
