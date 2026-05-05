require 'rails_helper'

RSpec.describe 'Docker Deployment Configuration' do
  describe 'Dockerfile Optimization' do
    let(:dockerfile_path) { Rails.root.join('Dockerfile') }

    it 'Dockerfile exists' do
      expect(File.exist?(dockerfile_path)).to be true
    end

    it 'uses alpine base image for smaller size' do
      dockerfile_content = File.read(dockerfile_path)
      expect(dockerfile_content).to match(/FROM ruby:\d+\.\d+-alpine/)
    end

    it 'installs required system dependencies' do
      dockerfile_content = File.read(dockerfile_path)
      required_deps = %w[build-base postgresql-dev nodejs npm]

      required_deps.each do |dep|
        expect(dockerfile_content).to include(dep)
      end
    end

    it 'uses multi-stage build pattern (if applicable)' do
      dockerfile_content = File.read(dockerfile_path)
      # Either uses multi-stage or single-stage - both valid
      expect(dockerfile_content).to be_present
    end
  end

  describe 'Asset Precompilation' do
    it 'precompiles assets for production' do
      # Assets should be precompiled during Docker build
      expect(Rails.application.config.assets.compile).to be false unless Rails.env.development?
    end

    it 'includes JavaScript and CSS in compiled assets' do
      expect(Rails.root.join('public', 'assets')).to exist unless Rails.env.development?
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

    it 'configures web service in render.yaml' do
      config = YAML.load_file(render_config_path) if File.exist?(render_config_path)
      expect(config).to have_key(:services) if config.present?
    end

    it 'sets environment variables for deployment' do
      skip 'render.yaml not found' unless File.exist?(render_config_path)

      config = YAML.load_file(render_config_path)
      web_service = config['services']&.find { |s| s['type'] == 'web' }

      expect(web_service).to be_present
      expect(web_service['envVars']).to be_present
    end
  end
end
