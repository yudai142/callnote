require "rails_helper"

RSpec.describe GroqTranscriptionService, type: :service do
  let(:call) { create(:call) }
  let(:api_url) { "https://api.groq.com/openai/v1/audio/transcriptions" }
  let(:transcription_text) { "こんにちは、本日の会議を始めます。" }

  before do
    allow(ENV).to receive(:fetch).with("GROQ_API_KEY", any_args).and_return("test_groq_key")
  end

  describe ".call" do
    context "APIリクエストが成功する場合" do
      before do
        stub_request(:post, api_url)
          .with(headers: { "Authorization" => "Bearer test_groq_key" })
          .to_return(status: 200, body: transcription_text, headers: {})
      end

      it "文字起こし結果を返す" do
        result = described_class.call(call)
        expect(result).to eq(transcription_text)
      end

      it "Groq API にリクエストを送信する" do
        described_class.call(call)
        expect(WebMock).to have_requested(:post, api_url)
          .with(headers: { "Authorization" => "Bearer test_groq_key" })
      end
    end

    context "APIリクエストが失敗する場合" do
      before do
        stub_request(:post, api_url)
          .to_return(status: 429, body: '{"error": "Rate limit exceeded"}', headers: {})
      end

      it "ApiError を発生させる" do
        expect { described_class.call(call) }.to raise_error(GroqTranscriptionService::ApiError)
      end
    end

    context "APIキーが設定されていない場合" do
      before do
        allow(ENV).to receive(:fetch).with("GROQ_API_KEY", any_args).and_call_original
        allow(ENV).to receive(:fetch).with("GROQ_API_KEY").and_raise(KeyError)
      end

      it "ApiError を発生させる" do
        expect { described_class.call(call) }.to raise_error(GroqTranscriptionService::ApiError, /GROQ_API_KEY/)
      end
    end

    context "サーバーエラーの場合" do
      before do
        stub_request(:post, api_url)
          .to_return(status: 500, body: "Internal Server Error", headers: {})
      end

      it "ApiError を発生させる" do
        expect { described_class.call(call) }.to raise_error(GroqTranscriptionService::ApiError, /500/)
      end
    end
  end
end
