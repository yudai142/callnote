# STEP 8: 外部 API 統合（Whisper・Claude）

## 目的
OpenAI Whisper API と Anthropic Claude API を統合し、文字起こし・要約機能を実装する。

## インストール
```bash
bundle add ruby-openai anthropic
```

## 環境変数設定

**`.env`** （プロジェクトルートに作成）
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

**`Gemfile`** に dotenv-rails 追加
```ruby
gem 'dotenv-rails', groups: [:development, :test]
```

## ファイル作成

**`app/services/whisper_service.rb`** （作成）
```ruby
class WhisperService
  def initialize
    @client = OpenAI::Client.new(access_token: ENV['OPENAI_API_KEY'])
  end

  def transcribe(call)
    raise "Audio not attached" unless call.audio.attached?

    begin
      audio_data = call.audio.download
      
      response = @client.audio.transcribe(
        model: "whisper-1",
        file: [audio_data, call.audio_filename]
      )
      
      response["text"]
    rescue StandardError => e
      Rails.logger.error("Whisper API error: #{e.message}")
      raise
    end
  end
end
```

**`app/services/claude_summary_service.rb`** （作成）
```ruby
class ClaudeSummaryService
  def initialize
    @client = Anthropic::Client.new(api_key: ENV['ANTHROPIC_API_KEY'])
  end

  def summarize(text)
    raise "Text is empty" if text.blank?

    begin
      response = @client.messages(
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: "以下の文字起こしをまとめてください。重要なポイントと行動項目を列挙してください:\n\n#{text}"
          }
        ]
      )
      
      response["content"].first["text"]
    rescue StandardError => e
      Rails.logger.error("Claude API error: #{e.message}")
      raise
    end
  end
end
```

## テスト方法（Rails console で）
```ruby
rails console

# Whisper API テスト
call = Call.first
service = WhisperService.new
transcription = service.transcribe(call)
puts transcription

# Claude API テスト
claude = ClaudeSummaryService.new
summary = claude.summarize("This is a test transcription...")
puts summary

# ジョブ実行テスト
TranscribeJob.perform_now(call.id)
```

## 次のステップ
→ [STEP 9: React フロントエンド開発](STEP_09_Reactフロントエンド.md)
