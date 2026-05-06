require 'rails_helper'

RSpec.describe 'Cloudinary Storage Integration' do
  describe 'Storage Configuration' do
    it 'storage.yml exists' do
      expect(File.exist?(Rails.root.join('config/storage.yml'))).to be true
    end

    it 'storage.yml is valid YAML' do
      storage_yml = YAML.load_file(Rails.root.join('config/storage.yml'))
      expect(storage_yml).to be_a(Hash)
    end

    it 'includes Cloudinary service definition' do
      storage_yml = YAML.load_file(Rails.root.join('config/storage.yml'))
      expect(storage_yml).to have_key('cloudinary')
    end
  end

  describe 'Active Storage Configuration' do
    it 'active storage service is configured' do
      expect(Rails.application.config.active_storage.service).to be_present
    end

    it 'uses local storage in development' do
      if Rails.env.development?
        expect(Rails.application.config.active_storage.service).to eq(:local)
      end
    end

    it 'uses cloudinary storage in production' do
      if Rails.env.production?
        expect(Rails.application.config.active_storage.service).to eq(:cloudinary)
      end
    end
  end

  describe 'Gemfile Dependencies' do
    it 'Cloudinary gem is included in Gemfile' do
      gemfile = File.read(Rails.root.join('Gemfile'))
      expect(gemfile).to include('cloudinary')
    end
  end
end
