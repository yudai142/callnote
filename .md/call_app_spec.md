# Rails + React（react-rails gem）通話音声文字起こし・要約アプリ 構築仕様書

## 技術スタック

### バックエンド
- Ruby on Rails 7.x（通常モード / API modeではない）
- PostgreSQL
- Active Storage（音声ファイル管理）
- Sidekiq + Redis（非同期ジョブ）
- OpenAI Whisper API（文字起こし）
- Anthropic Claude API（要約）
- Devise（ユーザー認証）

### フロントエンド
- React 18.x（react-rails gem 経由）
- esbuild（JSバンドル / shapackerの代わり）
- TypeScript（任意）
- Tailwind CSS + daisyUI（スタイリング）
- fetch API（Rails との通信）

---

## データモデル設計

### Usersテーブル（Devise）

| カラム名 | 型 | 説明 |
|---|---|---|
| id | integer | PK |
| email | string | メールアドレス（ログインID） |
| encrypted_password | string | 暗号化パスワード |
| created_at | datetime | - |
| updated_at | datetime | - |

### Callsテーブル

| カラム名 | 型 | 説明 |
|---|---|---|
| id | integer | PK |
| user_id | integer | FK（Usersテーブル） |
| title | string | 通話タイトル |
| status | string | pending / transcribing / summarizing / done / error |
| transcription | text | 文字起こし結果 |
| summary | text | 要約結果 |
| duration | integer | 通話時間（秒） |
| created_at | datetime | - |
| updated_at | datetime | - |

※ 音声ファイルはActive Storageで関連付け（has_one_attached :audio）
※ CallはUserに従属（belongs_to :user）

---

## ディレクトリ構成

```
app/
├── controllers/
│   ├── application_controller.rb  # before_action :authenticate_user!
│   └── calls_controller.rb         # 通常のRailsコントローラ
├── models/
│   └── call.rb
├── jobs/
│   ├── transcribe_job.rb
│   └── summarize_job.rb
├── services/
│   ├── whisper_service.rb
│   └── claude_summary_service.rb
├── models/
│   ├── user.rb                     # Deviseモジュール + has_many :calls
│   └── call.rb                     # belongs_to :user
├── javascript/
│   └── components/
│       ├── CallApp.jsx             # ルートコンポーネント
│       ├── CallList.jsx
│       ├── CallUploader.jsx
│       ├── CallDetail.jsx
│       └── AudioPlayer.jsx
└── views/
    ├── calls/
    │   └── index.html.erb          # Reactをマウントするビュー
    └── devise/                     # ログイン・新規登録画面（自動生成）
```

---

## ルーティング設計

```ruby
# config/routes.rb
Rails.application.routes.draw do
  devise_for :users                  # ログイン・登録・ログアウト

  resources :calls, only: [:index, :create, :show, :destroy] do
    member do
      get :audio  # 音声ファイルURL取得
    end
  end

  root 'calls#index'
end
```

---

## React のマウント方法（react-rails）

```erb
<%# app/views/calls/index.html.erb %>
<%= react_component("CallApp", {
  calls: @calls.as_json(include: :audio_attachment),
  csrf_token: form_authenticity_token
}) %>
```

---

## 処理フロー

```
1. ユーザーがm4aファイルをアップロード（React の CallUploader）
        ↓
2. fetch API で Rails の POST /calls に送信（multipart/form-data）
        ↓
3. Rails: Callレコード作成 + Active Storageに音声保存
        ↓
4. TranscribeJob（Sidekiq 非同期）起動
        ↓
5. Whisper APIに音声送信 → 文字起こし結果をDBに保存
        ↓
6. SummarizeJob（Sidekiq 非同期）起動
        ↓
7. Claude APIに文字起こし内容を送信 → 要約をDBに保存
        ↓
8. status を "done" に更新
        ↓
9. フロントエンドがポーリング（GET /calls/:id）で完了を検知
        ↓
10. 文字起こし・要約・音声プレイヤーを表示
```

---

## 主要Gem

```ruby
# Gemfile
gem 'react-rails'        # ReactコンポーネントをViewに埋め込む
gem 'jsbundling-rails'   # esbuildによるJSバンドル管理
gem 'cssbundling-rails'  # Tailwind CSS + daisyUI のバンドル管理
gem 'devise'             # ユーザー認証
gem 'sidekiq'            # 非同期ジョブ
gem 'ruby-openai'        # Whisper API（文字起こし）
gem 'anthropic'          # Claude API（要約）
gem 'rack-cors'          # 必要に応じてCORS設定
gem 'aws-sdk-s3'         # 本番S3利用時（任意）
```

---

## Docker 構成

### Dockerfile（開発・本番共通）

```dockerfile
FROM ruby:3.2-alpine

WORKDIR /app

# 必要なパッケージのインストール
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    nodejs \
    npm \
    git

# Gemfile のコピーと依存関係インストール
COPY Gemfile Gemfile.lock ./
RUN bundle install

# npm パッケージのコピーとインストール
COPY package.json package-lock.json ./
RUN npm install

# アプリケーションコードのコピー
COPY . .

# 本番環境用のアセットプリコンパイル（本番のみ実行）
# RUN RAILS_ENV=production bundle exec rails assets:precompile

EXPOSE 3000

CMD ["bundle", "exec", "rails", "s", "-b", "0.0.0.0"]
```

### docker-compose.yml（開発環境）

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: callnote_db
    environment:
      POSTGRES_USER: callnote_user
      POSTGRES_PASSWORD: callnote_password
      POSTGRES_DB: callnote_development
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U callnote_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: callnote_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: callnote_web
    command: >
      sh -c "bundle install &&
             bin/rails db:prepare &&
             bin/rails s -b 0.0.0.0"
    volumes:
      - .:/app
      - bundle_cache:/app/vendor/bundle
      - node_modules:/app/node_modules
    ports:
      - "3000:3000"
    environment:
      RAILS_ENV: development
      DATABASE_URL: postgresql://callnote_user:callnote_password@db:5432/callnote_development
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  sidekiq:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: callnote_sidekiq
    command: bundle exec sidekiq
    volumes:
      - .:/app
      - bundle_cache:/app/vendor/bundle
      - node_modules:/app/node_modules
    environment:
      RAILS_ENV: development
      DATABASE_URL: postgresql://callnote_user:callnote_password@db:5432/callnote_development
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    depends_on:
      - db
      - redis

  # （オプション）Sidekiq Web UI
  sidekiq-web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: callnote_sidekiq_web
    command: bundle exec sidekiq-web
    volumes:
      - .:/app
      - bundle_cache:/app/vendor/bundle
      - node_modules:/app/node_modules
    ports:
      - "8080:8080"
    environment:
      RAILS_ENV: development
      DATABASE_URL: postgresql://callnote_user:callnote_password@db:5432/callnote_development
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:
  bundle_cache:
  node_modules:
```

### docker-compose.prod.yml（本番環境）

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: callnote_db_prod
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: callnote_redis_prod
    volumes:
      - redis_data_prod:/data
    restart: always
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: callnote_web_prod
    command: >
      sh -c "bundle install &&
             RAILS_ENV=production bundle exec rails db:migrate &&
             bundle exec rails assets:precompile &&
             bundle exec rails s -b 0.0.0.0 -p 3000"
    environment:
      RAILS_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
      SECRET_KEY_BASE: ${SECRET_KEY_BASE}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    ports:
      - "3000:3000"
    restart: always
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  sidekiq:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: callnote_sidekiq_prod
    command: bundle exec sidekiq -c 10 -v
    environment:
      RAILS_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    restart: always
    depends_on:
      - db
      - redis

volumes:
  postgres_data_prod:
  redis_data_prod:
```

### .dockerignore

```
.git
.gitignore
.env
.env.local
docker-compose.yml
node_modules
tmp/
log/
coverage/
.DS_Store
*.swp
*.swo
```

### .env.example（Docker用）

```
# 開発環境
RAILS_ENV=development
DATABASE_URL=postgresql://callnote_user:callnote_password@db:5432/callnote_development
REDIS_URL=redis://redis:6379

# 本番環境
# RAILS_ENV=production
# DATABASE_URL=postgresql://user:password@db:5432/dbname
# REDIS_URL=redis://redis:6379

# API keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# 本番環境用
SECRET_KEY_BASE=<rake secret で生成した値>
```

---

## セットアップ手順

### 前提条件
- Ruby 3.2+ （ローカル開発のみ）
- Node.js 18+ （ローカル開発のみ）
- PostgreSQL
- Redis
- **Docker & Docker Compose** （推奨）

### Docker を使用した開発セットアップ

```bash
# 1. リポジトリをクローン
git clone <repository> callnote
cd callnote

# 2. 環境変数ファイルを作成
cp .env.example .env

# .env に API キーを設定
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# 3. Docker Compose でコンテナ起動
docker-compose up -d

# 4. DB初期化（初回のみ）
docker-compose exec web bundle exec rails db:create db:migrate

# 5. ブラウザにアクセス
# http://localhost:3000
```

### Docker 開発環境の操作

```bash
# コンテナの起動
docker-compose up

# コンテナのログを確認
docker-compose logs -f web

# Rails コンソール実行
docker-compose exec web bundle exec rails console

# DB マイグレーション実行
docker-compose exec web bundle exec rails db:migrate

# Sidekiq の状態確認
# Web UI: http://localhost:8080

# コンテナを停止
docker-compose down

# DB を含めて完全に削除
docker-compose down -v
```

### ローカル開発セットアップ（Docker 未使用）

```bash
bundle install
rails javascript:install:esbuild
rails generate react:install
rails generate devise:install
rails generate devise User
rails db:create db:migrate
```

### 起動（ローカル）
```bash
# Railsサーバー
rails s -p 3000

# esbuild ビルド（別ターミナル）
npm run build -- --watch

# Sidekiq（別ターミナル）
bundle exec sidekiq

# Redis（別ターミナル）
redis-server
```

---

## 環境変数（.env）

### 開発環境（Docker 使用時）

```
RAILS_ENV=development
DATABASE_URL=postgresql://callnote_user:callnote_password@db:5432/callnote_development
REDIS_URL=redis://redis:6379
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 本番環境（Docker 使用時）

```
RAILS_ENV=production
DATABASE_URL=postgresql://user:password@db:5432/dbname
REDIS_URL=redis://redis:6379
SECRET_KEY_BASE=<rake secret で生成>
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### ローカル開発環境（Docker 未使用）

```
RAILS_ENV=development
DATABASE_URL=postgresql://localhost/callnote_development
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 認証・アクセス制御

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  before_action :authenticate_user!  # 未ログインはログイン画面へリダイレクト
end

# app/controllers/calls_controller.rb
class CallsController < ApplicationController
  def index
    @calls = current_user.calls.order(created_at: :desc)  # 自分の通話のみ取得
  end

  def create
    @call = current_user.calls.build(call_params)  # ログインユーザーに紐付け
    # ...
  end
end
```

```ruby
# app/models/user.rb
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  has_many :calls, dependent: :destroy
end

# app/models/call.rb
class Call < ApplicationRecord
  belongs_to :user
  has_one_attached :audio
end
```

---

## 補足・拡張案

- **話者分離**: AssemblyAI APIに切り替えると「Aさん/Bさん」の発言を分けて記録可能
- **本番ストレージ**: Active Storage + AWS S3 or GCS に切り替え容易
- **WebSocket**: ActionCableを使うとポーリング不要でリアルタイム完了通知が可能
- **長時間音声対応**: 文字起こし結果を分割してClaudeに送るチャンク処理を実装推奨
- **API mode との違い**: react-rails構成ではRailsのセッション・CSRF保護をそのまま利用できるためセキュリティ設定がシンプル

---

## Docker 関連のトラブルシューティング

### DB接続エラー
```bash
# DB が起動待ちの場合は少し待ってから再度実行
docker-compose up

# DB をリセットしたい場合
docker-compose down -v
docker-compose up
```

### npm/Bundle のキャッシュクリア
```bash
# node_modules のキャッシュをクリア
docker-compose exec web rm -rf node_modules
docker-compose exec web npm install

# Gem のキャッシュをクリア
docker-compose exec web rm -rf vendor/bundle
docker-compose exec web bundle install
```

### コンテナ内へのアクセス
```bash
# bash シェルに入る
docker-compose exec web bash

# Rails console
docker-compose exec web bundle exec rails console

# DB console
docker-compose exec db psql -U callnote_user -d callnote_development
```

### Sidekiq ジョブキューの確認
```bash
# Redis 内のキューを確認
docker-compose exec redis redis-cli

# キューの内容表示
> KEYS *
> LLEN sidekiq
```
