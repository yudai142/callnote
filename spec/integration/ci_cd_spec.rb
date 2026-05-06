require 'rails_helper'

RSpec.describe 'CI/CD Configuration' do
  describe 'GitHub Actions Workflow' do
    let(:ci_config_path) { Rails.root.join('.github/workflows') }

    it 'has CI workflow directory' do
      expect(Dir.exist?(ci_config_path)).to be true
    end

    it 'has workflow configuration files' do
      ci_files = Dir.glob("#{ci_config_path}/*.yml")
      expect(ci_files.size).to be > 0
    end
  end

  describe 'Test Suite Configuration' do
    it 'RSpec is configured' do
      expect(File.exist?(Rails.root.join('spec/rails_helper.rb'))).to be true
    end

    it 'RuboCop configuration exists' do
      rubocop_config = Rails.root.join('.rubocop.yml')
      rubocop_todo = Rails.root.join('.rubocop_todo.yml')
      expect(rubocop_config.exist? || rubocop_todo.exist?).to be true
    end

    it 'package.json is configured for JavaScript' do
      expect(File.exist?(Rails.root.join('package.json'))).to be true
    end
  end

  describe 'Database Configuration' do
    it 'database connection is available' do
      expect {
        ActiveRecord::Base.connection.execute('SELECT 1')
      }.not_to raise_error
    end

    it 'database.yml configuration exists' do
      expect(File.exist?(Rails.root.join('config/database.yml'))).to be true
    end
  end
end
