# Docker セットアップ詳細ガイド

このドキュメントは、`setup.sh` を使用した Docker 環境構築の詳細と、トラブルシューティング情報を提供します。

---

## 📋 目次

1. [前提条件](#前提条件)
2. [クイックスタート](#クイックスタート)
3. [セットアップスクリプト詳細](#セットアップスクリプト詳細)
4. [Docker コマンド](#docker-コマンド)
5. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

### システム要件
- **OS**: macOS (M1/M2/Intel) または Linux
- **RAM**: 最小 4GB、推奨 8GB+
- **ディスク**: 10GB 以上の空き容量

### インストール済みであることを確認
```bash
# Docker
docker --version

# Docker Compose
docker-compose --version

# Git （オプション）
git --version
```

### インストール必須

#### macOS の場合
```bash
# Homebrew 経由（推奨）
brew install docker docker-compose

# または Docker Desktop をダウンロード
# https://www.docker.com/products/docker-desktop
```

#### Linux の場合
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose

# サービス起動
sudo systemctl start docker
```

---

## クイックスタート

### Step 1: スクリプトを実行可能にする
```bash
chmod +x setup.sh
```

### Step 2: スクリプト実行
```bash
./setup.sh
```

### Step 3: 対話式入力
スクリプトが以下を聞きます：
- OpenAI API Key（スキップ可）
- Anthropic API Key（スキップ可）

### Step 4: 完了待機
```
✅ Docker セットアップが完了しました！

🚀 アクセス方法:
  • Rails App: http://localhost:3000
  • Sidekiq Web UI: http://localhost:8080
```

---

## セットアップスクリプト詳細

### 実行内容

#### 1️⃣ 前提条件チェック
- Docker インストール確認
- Docker Compose インストール確認
- Docker デーモン起動確認

#### 2️⃣ プロジェクトディレクトリセットアップ
- 既存プロジェクト確認
- ストレージディレクトリ作成

#### 3️⃣ 環境変数ファイル作成
- `.env` ファイル生成
- API キーの対話式入力
- `SECRET_KEY_BASE` の自動生成

#### 4️⃣ Docker ファイル確認
- `Dockerfile` 存在確認
- `docker-compose.yml` 存在確認

#### 5️⃣ Docker コンテナ起動
```
- db (PostgreSQL 15)
- redis (Redis 7)
- web (Rails サーバー)
- sidekiq (バックグラウンドジョブ)
- sidekiq-web (Sidekiq管理UI)
```

#### 6️⃣ ヘルスチェック
- PostgreSQL 接続確認
- Redis ステータス確認

#### 7️⃣ Database 初期化
```bash
rails db:create
rails db:migrate
```

#### 8️⃣ React ビルド
```bash
npm run build
```

### スクリプトのログ出力

```
ℹ️  前提条件を確認しています...
✅ Docker がインストール済み
✅ Docker Compose がインストール済み
✅ Docker デーモンが起動中
...
✅ Django セットアップが完了しました！
```

---

## Docker コマンド

### 基本操作

```bash
# コンテナ起動
docker-compose up -d

# コンテナ停止
docker-compose stop

# コンテナ再開
docker-compose restart

# コンテナ削除（DB保持）
docker-compose down

# コンテナ削除（DB含めて完全削除）
docker-compose down -v
```

### ログ確認

```bash
# Rails ログをリアルタイム表示
docker-compose logs -f web

# Sidekiq ログ表示
docker-compose logs -f sidekiq

# Redis ログ表示
docker-compose logs -f redis

# PostgreSQL ログ表示
docker-compose logs -f db

# 全コンテナログ表示
docker-compose logs -f
```

### コンテナ内コマンド実行

```bash
# Rails console
docker-compose exec web bundle exec rails console

# DB console (psql)
docker-compose exec db psql -U callnote_user -d callnote_development

# Redis CLI
docker-compose exec redis redis-cli

# Bash シェル
docker-compose exec web bash

# Rails マイグレーション
docker-compose exec web bundle exec rails db:migrate

# Gem インストール
docker-compose exec web bundle install

# npm インストール
docker-compose exec web npm install

# React ビルド
docker-compose exec web npm run build
```

### デバッグ

```bash
# コンテナのステータス確認
docker-compose ps

# コンテナ詳細情報
docker-compose exec web env | grep DATABASE_URL

# Docker イメージ一覧
docker images

# ディスク使用量確認
docker system df
```

---

## トラブルシューティング

### エラー: Docker デーモンが起動していない

**症状**: `Cannot connect to the Docker daemon`

**解決方法**:
```bash
# macOS の場合
open /Applications/Docker.app

# Linux の場合
sudo systemctl start docker

# 確認
docker ps
```

### エラー: ポート 3000 が既に使用されている

**症状**: `bind: address already in use`

**解決方法**:
```bash
# ポート 3000 を使用しているプロセスを確認
lsof -i :3000

# または docker-compose で別ポートを指定
docker-compose run -p 3001:3000 web
```

### エラー: PostgreSQL が起動しない

**症状**: `psql: error: could not connect to server: Connection refused`

**解決方法**:
```bash
# 既存コンテナを完全削除
docker-compose down -v

# DB ボリュームを削除
docker volume rm callnote_postgres_data

# 再起動
docker-compose up -d

# ログ確認
docker-compose logs db
```

### エラー: Rails DB エラー `FATAL: role "callnote_user" does not exist`

**症状**: 
```
FATAL: role "callnote_user" does not exist
```

**解決方法**:
```bash
# DB コンテナを再初期化
docker-compose down -v

# 新しいコンテナで再起動
docker-compose up -d db

# 待機してから実行
sleep 10

# マイグレーション再実行
docker-compose exec web bundle exec rails db:create db:migrate
```

### エラー: メモリ不足 `Cannot allocate memory`

**症状**: コンテナが頻繁に停止する

**解決方法**:
```bash
# Docker メモリ制限を確認
docker info | grep "Memory"

# macOS Docker Desktop の場合は Preferences から増加
# Linux の場合は docker-compose.yml で memory limit を設定
```

### エラー: `bundle install` が失敗する

**症状**: 
```
Bundler can't find compatible versions for gems
```

**解決方法**:
```bash
# Gemfile.lock を削除
docker-compose exec web rm Gemfile.lock

# 再インストール
docker-compose exec web bundle install
```

### エラー: npm パッケージインストール失敗

**症状**:
```
npm ERR! Maximum call stack size exceeded
```

**解決方法**:
```bash
# node_modules をクリア
docker-compose exec web rm -rf node_modules package-lock.json

# キャッシュクリア
docker-compose exec web npm cache clean --force

# 再インストール
docker-compose exec web npm install
```

### エラー: `Cannot find module 'react'`

**症状**: React コンポーネントが読み込まれない

**解決方法**:
```bash
# npm install を確認
docker-compose exec web npm ls react

# 再インストール
docker-compose exec web npm install

# ビルド
docker-compose exec web npm run build

# Rails サーバー再起動
docker-compose restart web
```

### 動作確認：セットアップ後にすること

```bash
# 1. Rails サーバー確認
curl http://localhost:3000

# 2. Rails console で DB 確認
docker-compose exec web bundle exec rails console
  > User.count
  > Call.count

# 3. Redis 接続確認
docker-compose exec redis redis-cli
  > PING
  > KEYS *

# 4. Sidekiq の状態確認
curl http://localhost:8080 # Web UI

# 5. ログインしてアプリテスト
# ブラウザで http://localhost:3000 にアクセス
# → Sign up でユーザー登録
# → ダッシュボードでアップロードテスト
```

---

## Docker Compose ベストプラクティス

### 環境変数管理

```bash
# .env ファイルを使用（既に setup.sh で自動作成）
cat .env

# 一時的に環境変数をオーバーライド
RAILS_ENV=production docker-compose up

# 特定のサービスのみ環境変数指定
docker-compose exec -e RAILS_ENV=test web bundle exec rspec
```

### ボリューム管理

```bash
# 現在のボリューム一覧
docker volume ls

# 未使用のボリュームを削除
docker volume prune

# 特定ボリュームの詳細
docker volume inspect callnote_postgres_data
```

### イメージ管理

```bash
# イメージの再ビルド（変更がある場合）
docker-compose build

# 未使用のイメージ削除
docker image prune

# キャッシュなしでビルド
docker-compose build --no-cache
```

---

## 本番環境への移行

### docker-compose.prod.yml の使用

```bash
# 本番環境で起動
docker-compose -f docker-compose.prod.yml up -d

# ログ確認
docker-compose -f docker-compose.prod.yml logs -f web
```

### 環境変数の本番設定

```bash
# 本番用 .env ファイル作成
cp .env.docker.example .env.production

# 以下を編集
# - DATABASE_URL (本番DB接続文字列)
# - REDIS_URL (本番Redis)
# - SECRET_KEY_BASE (本番キー)
# - API キー

# 本番で起動
RAILS_ENV=production docker-compose -f docker-compose.prod.yml up -d
```

---

## 参考リンク

- [Docker Official Docs](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/reference/)
- [Rails on Docker Guide](https://guides.rubyonrails.org/docker.html)
- [Sidekiq In Docker](https://github.com/sidekiq/sidekiq/wiki/Docker)

---

**最終更新**: 2026年4月29日  
**対応バージョン**: Docker 20.10+, Docker Compose 2.0+
