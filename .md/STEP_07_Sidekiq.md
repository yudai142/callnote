# STEP 7: Sidekiq・非同期ジョブ設定

## 目的
Sidekiq + Redis で長時間かかる文字起こし・要約処理を非同期実行する仕組みを構築する。

## インストール
```bash
bundle add sidekiq redis

# Redis起動確認
redis-cli ping
# => PONG
```

## ファイル修正

**`Gemfile`** の確認
```ruby
gem 'sidekiq'
gem 'redis'
```

**`config/sidekiq.yml`** （作成）
```yaml
development:
  :concurrency: 5
  :timeout: 25
  :verbose: true
  :queues:
    - default
    - transcribe
    - summarize

production:
  :concurrency: 15
  :timeout: 25
  :queues:
    - default
    - transcribe
    - summarize
```

**`config/environments/development.rb`** に追加
```ruby
Rails.application.configure do
  # ... 他の設定
  
  config.active_job.queue_adapter = :sidekiq
end
```

**`config/environments/production.rb`** に追加
```ruby
Rails.application.configure do
  # ... 他の設定
  
  config.active_job.queue_adapter = :sidekiq
end
```

**`app/jobs/transcribe_job.rb`** （作成）
```ruby
class TranscribeJob < ApplicationJob
  queue_as :transcribe

  def perform(call_id)
    call = Call.find(call_id)
    
    begin
      call.update!(status: :transcribing)
      
      # Whisper API呼び出し（段階8で実装）
      transcription = WhisperService.new.transcribe(call)
      
      call.update!(transcription: transcription, status: :summarizing)
      
      # 要約ジョブ起動
      SummarizeJob.perform_later(call_id)
    rescue StandardError => e
      call.update!(status: :error)
      Rails.logger.error("TranscribeJob failed: #{e.message}")
    end
  end
end
```

**`app/jobs/summarize_job.rb`** （作成）
```ruby
class SummarizeJob < ApplicationJob
  queue_as :summarize

  def perform(call_id)
    call = Call.find(call_id)
    
    begin
      return if call.transcription.blank?
      
      call.update!(status: :summarizing)
      
      # Claude API呼び出し（段階8で実装）
      summary = ClaudeSummaryService.new.summarize(call.transcription)
      
      call.update!(summary: summary, status: :done)
    rescue StandardError => e
      call.update!(status: :error)
      Rails.logger.error("SummarizeJob failed: #{e.message}")
    end
  end
end
```

### Procfile.dev 更新
```
web: rails s -p 3000
js: npm run build -- --watch
css: npm run build:css -- --watch
sidekiq: bundle exec sidekiq -c 5 -v
redis: redis-server
```

## テスト方法
```bash
# 1. Redis起動
redis-server

# 2. Sidekiq起動
bundle exec sidekiq

# 3. Rails コンソールでジョブ実行テスト
rails console

call = Call.first
TranscribeJob.perform_later(call.id)

# 4. Sidekiq Web UI（オプション）
# Gemfile に gem 'sinatra' を追加
# routes.rb に require 'sidekiq/web'
#          Sidekiq::Web.use Rack::Auth::Basic do |u, p|
#            u == 'admin' && p == 'password'
#          end
#          mount Sidekiq::Web => '/sidekiq'
```

## 次のステップ
→ [STEP 8: 外部 API 統合（Whisper・Claude）](STEP_08_外部API.md)
