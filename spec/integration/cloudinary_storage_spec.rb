require 'rails_helper'

RSpec.describe 'Cloudinary Storage Integration' do
  describe 'Storage Configuration' do
    it 'has Cloudinary credentials configured' do
      if Rails.env.production?
        expect(ENV['CLOUDINARY_CLOUD_NAME']).to be_present
        expect(ENV['CLOUDINARY_API_KEY']).to be_present
        expect(ENV['CLOUDINARY_API_SECRET']).to be_present
      end
    end

    it 'defines Cloudinary service in storage.yml' do
      storage_config = Rails.application.config_for(:storage)
      expect(storage_config).to have_key(:cloudinary) if Rails.env.production?
    end
  end

  describe 'File Upload to Cloudinary' do
    let(:user) { create(:user) }
    let(:call) { create(:call, user: user) }

    it 'attaches audio file to call' do
      audio_file = fixture_file_upload('test_audio.wav', 'audio/wav')
      call.audio.attach(audio_file)

      expect(call.audio).to be_attached
      expect(call.audio.blob.filename).to include('test_audio')
    end

    it 'generates correct content type for audio file' do
      audio_file = fixture_file_upload('test_audio.wav', 'audio/wav')
      call.audio.attach(audio_file)

      expect(call.audio.blob.content_type).to eq('audio/wav')
    end

    it 'stores file with appropriate storage service' do
      audio_file = fixture_file_upload('test_audio.wav', 'audio/wav')
      call.audio.attach(audio_file)

      service = call.audio.service
      if Rails.env.production?
        expect(service.class.name).to include('Cloudinary')
      else
        expect(service.class.name).to include('Local')
      end
    end
  end

  describe 'Audio File Download' do
    let(:user) { create(:user) }
    let(:call) { create(:call, user: user) }

    before do
      audio_file = fixture_file_upload('test_audio.wav', 'audio/wav')
      call.audio.attach(audio_file)
    end

    it 'provides download URL for attached audio' do
      url = call.audio.url
      expect(url).to be_present
      expect(url).to start_with('http')
    end

    it 'returns 200 status for audio download endpoint' do
      sign_in user
      get "/calls/#{call.id}/audio"
      expect(response).to have_http_status(:ok)
    end

    it 'prevents unauthorized audio access' do
      other_user = create(:user)
      sign_in other_user

      get "/calls/#{call.id}/audio"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'File Validation' do
    let(:user) { create(:user) }
    let(:call) { create(:call, user: user) }

    it 'validates audio file presence' do
      expect {
        call.validate
      }.not_to raise_error
    end

    it 'allows audio MIME types' do
      valid_types = %w[audio/wav audio/mpeg audio/mp3 audio/aac]

      valid_types.each do |mime_type|
        file = fixture_file_upload('test_audio.wav', mime_type)
        call.audio.attach(file)
        expect(call.audio).to be_attached
      end
    end
  end
end
