# STEP 5: Active Storage・音声ファイル管理

## 目的
音声ファイルのアップロード・保存・取得機能を Active Storage で実装する。

## ファイル修正

**`app/models/call.rb`**
```ruby
class Call < ApplicationRecord
  belongs_to :user
  has_one_attached :audio, dependent: :destroy

  validates :title, presence: true
  validates :audio, presence: true, on: :create

  enum status: {
    pending: 'pending',
    transcribing: 'transcribing',
    summarizing: 'summarizing',
    done: 'done',
    error: 'error'
  }

  scope :recent, -> { order(created_at: :desc) }

  def audio_url
    return nil unless audio.attached?
    Rails.application.routes.url_helpers.rails_blob_path(audio, only_path: true)
  end

  def audio_filename
    audio.filename.to_s if audio.attached?
  end
end
```

**`config/storage.yml`**（ローカル開発環境用）
```yaml
local:
  service: Disk
  root: <%= Rails.root.join("storage") %>
```

**`config/environments/development.rb`**
```ruby
Rails.application.configure do
  # ... 他の設定

  config.active_storage.service = :local
  
  # publicフォルダからも音声取得可能にする
  config.active_storage.routes_prefix = '/rails/active_storage'
end
```

## DB マイグレーション確認
```bash
rails db:migrate:status
# active_storage_blobs, active_storage_attachments テーブルが追加されたか確認
```

## テスト方法（Rails console で）
```ruby
rails console

# User作成
user = User.create!(email: 'test@example.com', password: 'Passw0rd!')

# Callレコード作成
call = user.calls.create!(title: 'Test Call')

# 音声ファイルアップロード（テスト用ダミーファイル）
require 'open-uri'
call.audio.attach(
  io: StringIO.new("dummy audio data"),
  filename: "test.m4a",
  content_type: "audio/mp4"
)

# 確認
puts call.audio_url
puts call.audio_filename
```

## 次のステップ
→ [STEP 6: Calls コントローラ・API エンドポイント](STEP_06_CallsAPI.md)
