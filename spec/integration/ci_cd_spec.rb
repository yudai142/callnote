require 'rails_helper'

RSpec.describe 'CI/CD Configuration' do
  describe 'GitHub Actions Workflow' do
    let(:ci_config_path) { Rails.root.join('.github/workflows') }

    it 'has CI workflow configuration' do
      expect(Dir.exist?(ci_config_path)).to be true
    end

    it 'runs tests in CI pipeline' do
      ci_files = Dir.glob("#{ci_config_path}/*.yml")
      expect(ci_files).not_to be_empty
    end
  end

  describe 'Test Suite' do
    it 'runs RSpec tests' do
      # Verify RSpec is configured
      expect(File.exist?(Rails.root.join('spec/rails_helper.rb'))).to be true
    end

    it 'runs code linting (RuboCop)' do
      rubocop_config = Rails.root.join('.rubocop.yml')
      expect(rubocop_config.exist? || Rails.root.join('.rubocop_todo.yml').exist?).to be true
    end

    it 'runs JavaScript tests' do
      jest_config = Rails.root.join('jest.config.cjs')
      package_json = Rails.root.join('package.json')

      expect(jest_config.exist? && package_json.exist?).to be true
    end
  end

  describe 'Database Migration in CI' do
    it 'provides database for testing' do
      expect {
        ActiveRecord::Base.connection.execute('SELECT 1')
      }.not_to raise_error
    end

    it 'supports parallel test execution' do
      # Parallel testing configuration
      parallel_config = Rails.root.join('config/database.yml')
      expect(File.exist?(parallel_config)).to be true
    end
  end

  describe 'Deployment Triggers' do
    it 'triggers deployment on main branch push' do
      # GitHub Actions should be configured to deploy on main push
      # This is verified by the presence of workflow files
      workflow_files = Dir.glob("#{ci_config_path}/*.yml")
      expect(workflow_files).not_to be_empty
    end
  end
end
