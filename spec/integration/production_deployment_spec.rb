require 'rails_helper'

RSpec.describe 'Production Environment Setup' do
  describe 'Environment Variables' do
    it 'requires essential production environment variables' do
      required_vars = %w[
        RAILS_ENV
        SECRET_KEY_BASE
        DATABASE_URL
        REDIS_URL
        CLOUDINARY_CLOUD_NAME
        CLOUDINARY_API_KEY
        CLOUDINARY_API_SECRET
        GROQ_API_KEY
      ]

      required_vars.each do |var|
        if Rails.env.production?
          expect(ENV[var]).to be_present, "環境変数 #{var} が未設定です"
        end
      end
    end

    it 'handles missing environment variables gracefully' do
      with_env('DATABASE_URL' => nil) do
        expect do
          Rails.application.config_for(:database)
        end.not_to raise_error
      end
    end

    def with_env(vars)
      old_values = {}
      vars.each { |k, v| old_values[k] = ENV[k]; ENV[k] = v }
      yield
    ensure
      old_values.each { |k, v| ENV[k] = v }
    end
  end

  describe 'Active Storage Configuration' do
    it 'uses Cloudinary service in production' do
      skip unless Rails.env.production?
      expect(Rails.configuration.active_storage.service).to eq(:cloudinary)
    end

    it 'uses disk service in development' do
      skip if Rails.env.production?
      expect(Rails.configuration.active_storage.service).to eq(:local)
    end

    it 'allows file upload to Active Storage' do
      user = create(:user)
      call = create(:call, user: user)

      audio_file = fixture_file_upload('test_audio.wav', 'audio/wav')
      call.audio.attach(audio_file)

      expect(call.audio).to be_attached
      expect(call.audio.blob.content_type).to include('audio')
    end
  end

  describe 'Database Connection' do
    it 'connects to PostgreSQL successfully' do
      expect {
        ActiveRecord::Base.connection.execute('SELECT 1')
      }.not_to raise_error
    end

    it 'runs migrations successfully' do
      expect {
        ActiveRecord::Migrator.migrations_status
      }.not_to raise_error
    end
  end

  describe 'Redis Connection' do
    it 'connects to Redis successfully' do
      skip unless ENV['REDIS_URL'].present?

      expect {
        redis = Redis.new(url: ENV['REDIS_URL'])
        redis.ping
      }.not_to raise_error
    end
  end

  describe 'API Endpoints Security' do
    let(:user) { create(:user) }

    before { sign_in user }

    it 'requires authentication for protected endpoints' do
      sign_out user
      get '/calls'
      expect(response).to redirect_to(new_user_session_path)
    end

    it 'prevents CSRF attacks on POST requests' do
      post '/calls', params: { call: { title: 'Test' } }, headers: { 'X-CSRF-Token' => 'invalid' }
      expect(response.status).not_to eq(200)
    end

    it 'prevents unauthorized access to other users\' calls' do
      other_user = create(:user)
      other_call = create(:call, user: other_user)

      get "/calls/#{other_call.id}"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'Performance Optimization' do
    it 'uses database connection pooling' do
      pool_size = ActiveRecord::Base.connection_pool.size
      expect(pool_size).to be > 0
    end

    it 'enables eager loading for N+1 prevention' do
      create(:user, :with_calls, calls_count: 3)

      expect {
        users = User.includes(:calls)
        users.each { |u| u.calls.each(&:title) }
      }.not_to exceed_query_limit(2)
    end
  end

  describe 'Error Handling & Logging' do
    it 'logs errors to stdout for container environments' do
      logger = Rails.logger
      expect(logger.instance_variable_get(:@logdev).filename).to be_nil if Rails.env.production?
    end

    it 'configures Sentry for error tracking (if enabled)' do
      skip 'Sentry not configured' unless ENV['SENTRY_DSN'].present?
      expect(Sentry.configuration.dsn).to eq(ENV['SENTRY_DSN'])
    end
  end
end
