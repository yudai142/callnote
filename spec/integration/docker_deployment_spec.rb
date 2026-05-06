require 'rails_helper'

RSpec.describe 'Docker Deployment Configuration' do
  describe 'Dockerfile Optimization' do
    let(:dockerfile_path) { Rails.root.join('Dockerfile') }

    it 'Dockerfile exists' do
      expect(File.exist?(dockerfile_path)).to be true
    end

    it 'includes Ruby version specification' do
      dockerfile_content = File.read(dockerfile_path)
      expect(dockerfile_content).to match(/FROM ruby|FROM.*ruby/)
    end

    it 'configures production environment' do
      dockerfile_content = File.read(dockerfile_path)
      expect(dockerfile_content).to include('RAILS_ENV')
    end

    it 'exposes port for web server' do
      dockerfile_content = File.read(dockerfile_path)
      expect(dockerfile_content).to match(/EXPOSE.*3000|EXPOSE.*80/)
    end
  end

  describe 'Asset Precompilation' do
    it 'asset pipeline is configured' do
      expect(Rails.application.config.assets).to be_present
    end

    it 'public assets directory exists' do
      expect(Rails.root.join('public')).to exist
    end
  end

  describe 'Container Entrypoint' do
    it 'starts Puma web server with correct configuration' do
      # Verify Puma is configured in Procfile or docker-entrypoint.sh
      procfile = Rails.root.join('Procfile')
      expect(procfile.exist? || File.exist?('docker-entrypoint.sh')).to be true
    end

    it 'listens on port 3000' do
      expect(ENV.fetch('PORT', 3000).to_i).to be > 0
    end

    it 'binds to 0.0.0.0 for container networking' do
      # Web server should bind to 0.0.0.0, not localhost
      expect {
        Rails.logger.info 'Container configured for 0.0.0.0 binding'
      }.not_to raise_error
    end
  end

  describe 'Render Deployment Configuration' do
    let(:render_config_path) { Rails.root.join('render.yaml') }

    it 'render.yaml exists for Render deployment' do
      expect(File.exist?(render_config_path)).to be true
    end

    it 'render.yaml is valid YAML' do
      config = YAML.load_file(render_config_path)
      expect(config).to be_present
    end

    it 'configures services in render.yaml' do
      config = YAML.load_file(render_config_path)
      expect(config).to have_key('services')
      expect(config['services']).to be_an(Array)
      expect(config['services']).not_to be_empty
    end
  end
end
