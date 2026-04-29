# Rails + React 通話音声文字起こし・要約アプリ 段階的構築ガイド

**対象**: Rails 7.x + React 18 + Whisper API + Claude API

このガイドは、`call_app_spec.md` の仕様を**10個の実行段階**に分解し、各段階で必要なコマンド・コード全文・テスト方法を記載しています。

---

## 段階 1: Rails プロジェクト初期化

### 目的
Rails 7.x プロジェクトをゼロから作成し、基本的なプロジェクト構造を確立する。

### 前提条件
```bash
ruby --version          # >= 3.2
node --version          # >= 18
postgres --version      # 実行中
redis-cli --version     # 実行中（Sidekiq用）
```

### 実行コマンド
```bash
# 1. 新規Railsプロジェクト作成（APIモードではなく通常モード）
rails new callnote --database=postgresql --skip-test --skip-spring

cd callnote

# 2. bundle install
bundle install

# 3. DB作成
rails db:create
```

### ファイル確認
```bash
# config/database.yml が生成されたか確認
cat config/database.yml | grep -A 5 "development:"
```

### テスト方法
```bash
rails s -p 3000
# ブラウザで http://localhost:3000 にアクセス
# "Yay! You're on Rails!" が表示されたらOK
```

---

## 段階 2: データモデル・マイグレーション設計

### 目的
ユーザー・通話データベーススキーマを設計し、マイグレーションを実行する。

### 実行コマンド
```bash
# 1. Userモデル生成（Deviseプリセット）
rails generate model user email:string encrypted_password:string

# 2. Callモデル生成
rails generate model call user:references title:string status:string \
  transcription:text summary:text duration:integer

# 3. Callモデルに音声ファイル添付を準備（Active Storage）
rails active_storage:install

# 4. マイグレーション実行
rails db:migrate
```

### ファイル追加・修正

**`db/migrate/*_create_users.rb`** （生成後、修正）
```ruby
class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :encrypted_password, null: false
      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
```

**`db/migrate/*_create_calls.rb`** （生成後、修正）
```ruby
class CreateCalls < ActiveRecord::Migration[7.0]
  def change
    create_table :calls do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, default: "Untitled Call"
      t.string :status, default: "pending"  # pending/transcribing/summarizing/done/error
      t.text :transcription
      t.text :summary
      t.integer :duration, default: 0  # 秒単位
      t.timestamps
    end
    add_index :calls, :user_id
    add_index :calls, :status
  end
end
```

### テスト方法
```bash
# マイグレーション履歴確認
rails db:migrate:status

# テーブル確認
rails dbconsole << 'EOF'
\dt
\d users
\d calls
EOF
```

---

## 段階 3: Devise 認証・ユーザー管理

### 目的
ユーザー登録・ログイン・ログアウト機能を Devise で実装する。

### インストール
```bash
# 1. Devise gem追加
cat >> Gemfile << 'EOF'
gem 'devise'
gem 'rail_semantic_logger'  # ログ出力改善（オプション）
EOF

bundle install

# 2. Devise 初期化
rails generate devise:install

# 3. User モデルへ Devise設定
rails generate devise User

# 4. マイグレーション実行
rails db:migrate
```

### ファイル修正

**`app/models/user.rb`**
```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :calls, dependent: :destroy

  validates :email, presence: true, uniqueness: true
end
```

**`app/controllers/application_controller.rb`**
```ruby
class ApplicationController < ActionController::Base
  before_action :authenticate_user!, unless: :devise_controller?

  rescue_from ActiveRecord::RecordNotFound, with: :render_404

  private

  def render_404
    render file: Rails.root.join('public/404.html'), status: 404
  end
end
```

**`config/routes.rb`**
```ruby
Rails.application.routes.draw do
  devise_for :users

  root 'calls#index'
end
```

### ビューファイル確認
```bash
# Devise ビュー自動生成
rails generate devise:views

# 確認
ls app/views/devise/
```

### テスト方法
```bash
rails s -p 3000

# 1. http://localhost:3000 にアクセス → ログイン画面へリダイレクト
# 2. "Sign up" で新規登録
# 3. email / password を入力 → ダッシュボードへ
# 4. "Sign out" でログアウト
```

---

## 段階 4: React・JavaScript ビルドシステム設定

### 目的
esbuild + react-rails を使用して React コンポーネントを Rails ビューに埋め込める環境を構築する。

### インストール
```bash
# 1. jsbundling-rails + react-rails インストール
bundle add jsbundling-rails react-rails cssbundling-rails

# 2. esbuild 初期化
rails javascript:install:esbuild

# 3. Tailwind CSS + daisyUI セットアップ
rails css:install:tailwind

# 4. React 初期化
rails generate react:install
```

### ファイル確認・修正

**`package.json`** に以下が含まれているか確認
```json
{
  "dependencies": {
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "@rails/webpacker": "^6.0.0"
  },
  "scripts": {
    "build": "esbuild app/javascript/*.* --bundle --sourcemap --outdir=app/assets/builds",
    "build:css": "tailwindcss -i ./app/assets/stylesheets/application.tailwind.css -o ./app/assets/builds/application.css"
  }
}
```

**`Procfile.dev`** （開発用サーバー管理）
```
web: rails s -p 3000
js: npm run build -- --watch
css: npm run build:css -- --watch
```

### テスト方法
```bash
# 1. build スクリプト実行
npm run build

# 2. Rails サーバー起動
rails s -p 3000

# 3. ブラウザの Developer Tools → Network タブ確認
#    JavaScript が /assets/builds/..js で読み込まれるか確認
```

---

## 段階 5: Active Storage・音声ファイル管理

### 目的
音声ファイルのアップロード・保存・取得機能を Active Storage で実装する。

### ファイル修正

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

### DB マイグレーション確認
```bash
rails db:migrate:status
# active_storage_blobs, active_storage_attachments テーブルが追加されたか確認
```

### テスト方法（Rails console で）
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

---

## 段階 6: Calls コントローラ・API エンドポイント

### 目的
REST API エンドポイント（index, create, show, destroy）を実装し、音声ファイルのアップロード・取得を可能にする。

### ファイル作成・修正

**`app/controllers/calls_controller.rb`**
```ruby
class CallsController < ApplicationController
  before_action :set_call, only: [:show, :destroy, :audio]
  
  def index
    @calls = current_user.calls.recent.as_json(methods: [:audio_url, :audio_filename])
    render json: @calls
  end

  def create
    @call = current_user.calls.build(call_params)

    if @call.save
      render json: @call.as_json(methods: [:audio_url, :audio_filename]), status: :created
    else
      render json: @call.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @call.as_json(methods: [:audio_url, :audio_filename])
  end

  def destroy
    @call.destroy!
    render json: { message: 'Call deleted' }, status: :ok
  end

  def audio
    if @call.audio.attached?
      send_data @call.audio.download, 
                filename: @call.audio_filename,
                type: @call.audio.content_type
    else
      render json: { error: 'Audio not found' }, status: :not_found
    end
  end

  private

  def set_call
    @call = current_user.calls.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Not found' }, status: :not_found
  end

  def call_params
    params.require(:call).permit(:title, :audio, :duration)
  end
end
```

**`config/routes.rb`** （更新）
```ruby
Rails.application.routes.draw do
  devise_for :users

  resources :calls, only: [:index, :create, :show, :destroy] do
    member do
      get :audio
    end
  end

  root 'calls#index'
end
```

### テスト方法（curl で）
```bash
# ユーザー登録・ログイン後、セッションクッキーを取得
# 例: cookie_value="your_session_cookie"

# 1. Callリスト取得
curl -X GET http://localhost:3000/calls \
  -H "Cookie: _callnote_session=cookie_value"

# 2. Call作成（音声ファイル付き）
curl -X POST http://localhost:3000/calls \
  -H "Cookie: _callnote_session=cookie_value" \
  -F "call[title]=Meeting 001" \
  -F "call[audio]=@/path/to/audio.m4a"

# 3. 音声ダウンロード
curl -X GET http://localhost:3000/calls/1/audio \
  -H "Cookie: _callnote_session=cookie_value" \
  -o downloaded_audio.m4a
```

---

## 段階 7: Sidekiq・非同期ジョブ設定

### 目的
Sidekiq + Redis で長時間かかる文字起こし・要約処理を非同期実行する仕組みを構築する。

### インストール
```bash
bundle add sidekiq redis

# Redis起動確認
redis-cli ping
# => PONG
```

### ファイル修正

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

### テスト方法
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

---

## 段階 8: 外部 API 統合（Whisper・Claude）

### 目的
OpenAI Whisper API と Anthropic Claude API を統合し、文字起こし・要約機能を実装する。

### インストール
```bash
bundle add ruby-openai anthropic
```

### 環境変数設定

**`.env`** （プロジェクトルートに作成）
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

**`Gemfile`** に dotenv-rails 追加
```ruby
gem 'dotenv-rails', groups: [:development, :test]
```

### ファイル作成

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

### テスト方法（Rails console で）
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

---

## 段階 9: React フロントエンド開発

### 目的
React コンポーネントを使用してUI/UXを実装し、ユーザーが通話をアップロード・確認・再生できる画面を構築する。

### ディレクトリ構成
```
app/javascript/components/
├── CallApp.jsx              # ルートコンポーネント
├── CallList.jsx             # 通話リスト表示
├── CallUploader.jsx         # ファイルアップロード
├── CallDetail.jsx           # 通話詳細・文字起こし表示
└── AudioPlayer.jsx          # 音声プレイヤー
```

### ファイル作成

**`app/javascript/components/CallApp.jsx`**
```jsx
import React, { useState, useEffect } from 'react';
import CallList from './CallList';
import CallUploader from './CallUploader';

export default function CallApp() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const response = await fetch('/calls', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]')?.content
        }
      });
      const data = await response.json();
      setCalls(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
    // ポーリング: 5秒ごとに更新
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = (newCall) => {
    setCalls([newCall, ...calls]);
  };

  const handleDeleteCall = (callId) => {
    setCalls(calls.filter(c => c.id !== callId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">通話音声文字起こしアプリ</h1>
        
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CallUploader onUploadSuccess={handleUploadSuccess} />
          </div>
          
          <div className="lg:col-span-2">
            <CallList
              calls={calls}
              loading={loading}
              onDeleteCall={handleDeleteCall}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**`app/javascript/components/CallUploader.jsx`**
```jsx
import React, { useState } from 'react';

export default function CallUploader({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      
      // 音声ファイルの長さ取得
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        setDuration(Math.round(audio.duration));
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fileInput = e.target.querySelector('input[type="file"]');
    const formData = new FormData();
    formData.append('call[title]', title || fileName.split('.')[0]);
    formData.append('call[audio]', fileInput.files[0]);
    formData.append('call[duration]', duration);

    try {
      const response = await fetch('/calls', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]')?.content
        }
      });

      if (response.ok) {
        const newCall = await response.json();
        onUploadSuccess(newCall);
        setFileName('');
        setTitle('');
        setDuration(0);
        fileInput.value = '';
      } else {
        alert('アップロード失敗');
      }
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4">新しい通話をアップロード</h2>
      
      <input
        type="text"
        placeholder="通話タイトル（オプション）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full mb-4"
      />

      <label className="form-control w-full mb-4">
        <div className="label">
          <span className="label-text">音声ファイル (m4a, mp3, wav)</span>
        </div>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="file-input file-input-bordered w-full"
          required
        />
      </label>

      {fileName && <p className="text-sm text-gray-600 mb-2">ファイル: {fileName}</p>}
      {duration > 0 && <p className="text-sm text-gray-600 mb-4">長さ: {duration}秒</p>}

      <button
        type="submit"
        disabled={loading || !fileName}
        className="btn btn-primary w-full"
      >
        {loading ? '処理中...' : 'アップロード'}
      </button>
    </form>
  );
}
```

**`app/javascript/components/CallList.jsx`**
```jsx
import React from 'react';
import CallDetail from './CallDetail';

export default function CallList({ calls, loading, onDeleteCall }) {
  if (loading && calls.length === 0) {
    return <div className="loading loading-spinner"></div>;
  }

  if (calls.length === 0) {
    return <p className="text-gray-500">通話がありません</p>;
  }

  return (
    <div className="space-y-4">
      {calls.map((call) => (
        <CallDetail
          key={call.id}
          call={call}
          onDelete={onDeleteCall}
        />
      ))}
    </div>
  );
}
```

**`app/javascript/components/CallDetail.jsx`**
```jsx
import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';

export default function CallDetail({ call, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      const response = await fetch(`/calls/${call.id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]')?.content
        }
      });

      if (response.ok) {
        onDelete(call.id);
      }
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'badge badge-warning',
      transcribing: 'badge badge-info',
      summarizing: 'badge badge-info',
      done: 'badge badge-success',
      error: 'badge badge-error'
    };
    return statusMap[status] || 'badge';
  };

  const getStatusText = (status) => {
    const textMap = {
      pending: '待機中',
      transcribing: '文字起こし中',
      summarizing: '要約中',
      done: '完了',
      error: 'エラー'
    };
    return textMap[status] || status;
  };

  return (
    <div className="card bg-base-100 shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{call.title}</h3>
          <p className="text-sm text-gray-500">{new Date(call.created_at).toLocaleString('ja-JP')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={getStatusBadge(call.status)}>
            {getStatusText(call.status)}
          </span>
          <button
            onClick={handleDelete}
            className="btn btn-sm btn-ghost"
          >
            ✕
          </button>
        </div>
      </div>

      {call.audio_url && (
        <div className="mb-4">
          <AudioPlayer url={call.audio_url} filename={call.audio_filename} />
        </div>
      )}

      {call.transcription && (
        <div className="mb-4">
          <h4 className="font-bold text-lg mb-2">文字起こし</h4>
          <p className="text-sm bg-gray-50 p-4 rounded">{call.transcription}</p>
        </div>
      )}

      {call.summary && (
        <div>
          <h4 className="font-bold text-lg mb-2">要約</h4>
          <p className="text-sm bg-blue-50 p-4 rounded">{call.summary}</p>
        </div>
      )}

      {call.status === 'error' && (
        <div className="alert alert-error">
          <span>処理中にエラーが発生しました</span>
        </div>
      )}
    </div>
  );
}
```

**`app/javascript/components/AudioPlayer.jsx`**
```jsx
import React, { useRef } from 'react';

export default function AudioPlayer({ url, filename }) {
  const audioRef = useRef(null);

  return (
    <div className="bg-gray-100 p-4 rounded">
      <p className="text-sm font-semibold mb-2">音声: {filename}</p>
      <audio
        ref={audioRef}
        controls
        className="w-full"
        style={{ height: '40px' }}
      >
        <source src={url} type="audio/mp4" />
        ブラウザが音声再生に対応していません
      </audio>
    </div>
  );
}
```

### ビューファイル修正

**`app/views/calls/index.html.erb`** （作成）
```erb
<%= react_component("CallApp", {
  csrf_token: form_authenticity_token
}) %>
```

### テスト方法
```bash
# 1. npm build
npm run build

# 2. Rails サーバー起動
rails s -p 3000

# 3. ブラウザで http://localhost:3000 にアクセス
# 4. ログイン → アップロードフォーム表示
```

---

## 段階 10: デプロイ・最適化・テスト

### 目的
本番環境へのデプロイ準備、パフォーマンス最適化、テストスイート構築を行う。

### 1. テストスイート構築

**`Gemfile`** にテスト関連 gem 追加
```ruby
group :test do
  gem 'rspec-rails'
  gem 'factory_bot_rails'
  gem 'faker'
end
```

**`spec/models/user_spec.rb`** （作成）
```ruby
require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email) }
  end

  describe 'associations' do
    it { is_expected.to have_many(:calls).dependent(:destroy) }
  end
end
```

**`spec/models/call_spec.rb`** （作成）
```ruby
require 'rails_helper'

RSpec.describe Call, type: :model do
  let(:user) { create(:user) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to belong_to(:user) }
  end

  describe '#audio_url' do
    it 'returns nil when audio is not attached' do
      call = build(:call, user: user)
      expect(call.audio_url).to be_nil
    end
  end
end
```

**`spec/factories/users.rb`** （作成）
```ruby
FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { 'Passw0rd!' }
    password_confirmation { 'Passw0rd!' }
  end
end
```

**`spec/factories/calls.rb`** （作成）
```ruby
FactoryBot.define do
  factory :call do
    user
    title { Faker::Lorem.sentence }
    status { 'pending' }
    duration { rand(60..600) }
  end
end
```

### 2. 本番環境設定

**`.env.production`** （本番環境変数）
```
RAILS_ENV=production
RAILS_LOG_TO_STDOUT=true
SECRET_KEY_BASE=<rake secret で生成>
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://...:6379
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**`config/environments/production.rb`** 設定
```ruby
Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false
  config.log_level = :debug
  config.log_to_stdout = ENV["RAILS_LOG_TO_STDOUT"].present?

  # セッション・CSRF保護
  config.session_store :cookie_store, key: '_callnote_session'
  
  # ActiveJob
  config.active_job.queue_adapter = :sidekiq

  # Active Storage
  config.active_storage.service = :amazon  # あるいは :google
end
```

### 3. Dockerfile & Docker Compose

**`Dockerfile`** （作成）
```dockerfile
FROM ruby:3.2-alpine

WORKDIR /app

# 必要なパッケージ
RUN apk add --no-cache \
    build-base postgresql-dev nodejs npm

COPY Gemfile Gemfile.lock ./
RUN bundle install --without development test

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN bundle exec rails assets:precompile

EXPOSE 3000

CMD ["bundle", "exec", "rails", "s", "-b", "0.0.0.0"]
```

**`docker-compose.yml`** （作成）
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: callnote
      POSTGRES_PASSWORD: password
      POSTGRES_DB: callnote_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7

  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://callnote:password@db:5432/callnote_prod
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis
    command: >
      sh -c "bundle exec rails db:migrate &&
             bundle exec rails s -b 0.0.0.0"

  sidekiq:
    build: .
    environment:
      DATABASE_URL: postgresql://callnote:password@db:5432/callnote_prod
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis
    command: bundle exec sidekiq

volumes:
  postgres_data:
```

### 4. GitHub Actions CI/CD

**`.github/workflows/ci.yml`** （作成）
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.2
          bundler-cache: true
      
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm
      
      - name: Database setup
        run: |
          bundle exec rails db:create
          bundle exec rails db:migrate
        env:
          RAILS_ENV: test
      
      - name: Run tests
        run: bundle exec rspec
        env:
          RAILS_ENV: test
      
      - name: Lint
        run: |
          bundle exec rubocop
```

### 5. パフォーマンス最適化

**キャッシング有効化** - `config/environments/production.rb`
```ruby
config.cache_store = :redis_cache_store, { 
  url: ENV['REDIS_URL'] 
}
```

**N+1 クエリ回避** - `app/controllers/calls_controller.rb`
```ruby
def index
  @calls = current_user.calls.includes(:audio_attachment).recent
  render json: @calls
end
```

### テスト実行
```bash
# 1. テストDB作成・マイグレーション
RAILS_ENV=test rails db:create db:migrate

# 2. RSpec実行
bundle exec rspec

# 3. Rubocop（コード品質）
bundle exec rubocop

# 4. 本番ビルド
RAILS_ENV=production bundle exec rails assets:precompile
```

### デプロイ（例: Render）
```bash
# 1. Git push
git push origin main

# 2. Render Dashboard でデプロイ実行
# 環境変数設定済みの場合、自動デプロイ

# 3. DB マイグレーション確認
# Render コンソール で rails db:migrate 実行
```

### 最終チェックリスト
- [ ] ユーザー登録・ログイン動作確認
- [ ] 音声アップロード機能確認
- [ ] 文字起こし機能確認（Whisper API）
- [ ] 要約機能確認（Claude API）
- [ ] Sidekiq ジョブ定期実行確認
- [ ] エラーハンドリング確認
- [ ] レスポンシブデザイン確認（スマートフォン対応）
- [ ] API レート制限対策確認
- [ ] ログ出力確認
- [ ] セキュリティ設定（CSRF, CORS）確認

---

## 補足: トラブルシューティング

### よくあるエラー

**Rails server が起動しない**
```bash
rails db:create db:migrate
yarn/npm install
bundle install --local
```

**Sidekiq ジョブが実行されない**
```bash
redis-cli ping  # PONG が返るか確認
bundle exec sidekiq -v  # バージョン確認
```

**React コンポーネントが表示されない**
```bash
npm run build
rails webpacker:compile  # or rails assets:precompile
```

**API キー エラー**
```bash
cat .env  # キーが正しく設定されているか確認
echo $OPENAI_API_KEY
```

---

## 参考資料

- [Rails 公式ガイド](https://guides.rubyonrails.org/)
- [React 公式ドキュメント](https://react.dev/)
- [Devise README](https://github.com/heartcombo/devise)
- [Sidekiq 公式](https://sidekiq.org/)
- [OpenAI Ruby Gem](https://github.com/alexrudall/ruby-openai)
- [Anthropic Ruby SDK](https://github.com/anthropics/anthropic-sdk-python)
