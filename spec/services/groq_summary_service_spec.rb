require "rails_helper"

RSpec.describe GroqSummaryService, type: :service do
  let(:api_url) { "https://api.groq.com/openai/v1/chat/completions" }
  let(:transcription) { "本日の会議では、プロジェクトの進捗を確認しました。" }
  let(:summary_text) { "- プロジェクト進捗確認\n- 次回アクションアイテム設定" }
  let(:groq_response) do
    {
      choices: [
        { message: { content: summary_text } }
      ]
    }.to_json
  end

  before do
    allow(ENV).to receive(:fetch).with("GROQ_API_KEY", any_args).and_return("test_groq_key")
  end

  describe ".call" do
    context "APIリクエストが成功する場合" do
      before do
        stub_request(:post, api_url)
          .with(
            headers: {
              "Authorization" => "Bearer test_groq_key",
              "Content-Type" => "application/json"
            }
          )
          .to_return(status: 200, body: groq_response, headers: { "Content-Type" => "application/json" })
      end

      it "要約テキストを返す" do
        result = described_class.call(transcription)
        expect(result).to eq(summary_text)
      end

      it "正しいモデルでリクエストを送信する" do
        described_class.call(transcription)
        expect(WebMock).to have_requested(:post, api_url)
          .with(body: hash_including("model" => "llama3-8b-8192"))
      end

      it "文字起こしテキストをプロンプトに含める" do
        described_class.call(transcription)
        expect(WebMock).to have_requested(:post, api_url)
          .with(body: hash_including("messages" => array_including(
            hash_including("role" => "user", "content" => include(transcription))
          )))
      end
    end

    context "APIリクエストが失敗する場合" do
      before do
        stub_request(:post, api_url)
          .to_return(status: 503, body: "Service Unavailable", headers: {})
      end

      it "ApiError を発生させる" do
        expect { described_class.call(transcription) }.to raise_error(GroqSummaryService::ApiError)
      end
    end

    context "レスポンスに content が含まれない場合" do
      before do
        stub_request(:post, api_url)
          .to_return(status: 200, body: '{"choices": [{"message": {}}]}',
                     headers: { "Content-Type" => "application/json" })
      end

      it "ApiError を発生させる" do
        expect { described_class.call(transcription) }.to raise_error(GroqSummaryService::ApiError, /content/)
      end
    end
  end
end
