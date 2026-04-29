# Docker 環境構築 完了レポート

**作成日**: 2026年4月29日  
**プロジェクト**: Rails + React 通話音声文字起こし・要約アプリ  
**環境**: Docker & Docker Compose

---

## ✅ 完了したセットアップ

### 1️⃣ 前提条件チェック
- ✅ Docker インストール済み
- ✅ Docker Compose インストール済み  
- ✅ Docker デーモン起動中

### 2️⃣ ファイル構成
```
callnote/
├── Dockerfile                       # Rails/React アプリイメージ定義
├── docker-compose.yml              # 開発環境オーケストレーション
├── .dockerignore                   # Docker ビルド除外ファイル
├── .env                            # 環境変数（自動生成）
├── .env.docker.example             # 環境変数テンプレート
├── .gitignore                      # Git 除外ファイル
├── Gemfile                         # Ruby gem 依存関係
├── package.json                    # npm 依存関係
├── setup.sh                        # 自動セットアップスクリプト
├── docker-setup-instructions.md    # 詳細ガイド
└── SETUP_GUIDE_FOR_CLAUDE_CODE.md # Claude Code 用プロンプト
```

### 3️⃣ Docker イメージビルド
- ✅ `callnote-web` イメージ生成
- ✅ `callnote-sidekiq` イメージ生成
- ✅ `callnote-sidekiq-web` イメージ生成
- ✅ キャッシュなし再ビルド完了

### 4️⃣ Docker コンテナ起動
```
✅ callnote_db (PostgreSQL 15)        - healthy
✅ callnote_redis (Redis 7)           - healthy
⏳ callnote_web (Rails + React)       - 起動中
⏳ callnote_sidekiq (Background Jobs) - 起動中
⏳ callnote_sidekiq_web (Web UI)      - 起動中
```

※ `⏳` = セットアップ進行中

### 5️⃣ 環境設定ファイル
- ✅ `.env` ファイル作成
  - `RAILS_ENV=development`
  - `DATABASE_URL=postgresql://...`
  - `REDIS_URL=redis://...`
  - API キーはスキップ（後から編集可能）

---

## 🚀 次のステップ

### Step 1: Web サーバーの起動確認（30-60秒待機）
```bash
cd /Users/yudai/Projects/callnote

# ログを監視
docker-compose logs -f web

# ポート 3000 でリッスン中か確認
curl http://localhost:3000
```

### Step 2: ブラウザアクセス
```
http://localhost:3000
```

初期状態ではスタイル未適用の可能性があります（React ビルド待機中）

### Step 3: ユーザー登録・ログイン
```
1. "Sign up" をクリック
2. Email / Password を入力
3. アカウント作成
```

### Step 4: API キーの設定（オプション）
```bash
# .env ファイルを編集
nano .env

# 以下を入力
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# 変更を反映
docker-compose restart web sidekiq
```

---

## 📋 主要コマンド

### コンテナ操作
```bash
# 全コンテナ起動
docker-compose up -d

# 全コンテナ停止
docker-compose down

# 特定サービス再起動
docker-compose restart web

# ログ監視
docker-compose logs -f
```

### Rails コマンド
```bash
# Rails console
docker-compose exec web bundle exec rails console

# DB マイグレーション
docker-compose exec web bundle exec rails db:migrate

# DB リセット
docker-compose exec web bundle exec rails db:reset
```

### 確認コマンド
```bash
# コンテナステータス
docker-compose ps

# ポート確認
netstat -an | grep 3000  # Rails
netstat -an | grep 6379  # Redis  
netstat -an | grep 5432  # PostgreSQL

# ディスク使用量
docker system df
```

---

## 🔍 トラブルシューティング

### Rails サーバーが起動しない
```bash
# ログ確認
docker-compose logs web | tail -50

# セットアップコマンド手動実行
docker-compose exec web bundle install
docker-compose exec web npm install
docker-compose exec web bin/rails db:migrate

# 再起動
docker-compose restart web
```

### ポート競合エラー
```bash
# ポート 3000 を使用しているプロセスを確認
lsof -i :3000

# 別ポートで起動
docker-compose run -p 3001:3000 web
```

### DB 接続エラー
```bash
# DB コンテナ確認
docker-compose logs db

# DB をリセット
docker-compose down -v
docker-compose up -d
```

###ノード/npm エラー
```bash
# キャッシュクリア
docker-compose exec web rm -rf node_modules package-lock.json
docker-compose exec web npm install
```

---

## 📁 ファイル説明

| ファイル | 用途 |
|---|---|
| `Dockerfile` | Rails アプリケーションの Docker イメージ定義 |
| `docker-compose.yml` | PostgreSQL, Redis, Rails, Sidekiq のコンテナ統合設定 |
| `.env` | 環境変数（API キー、DB 接続等） |
| `Gemfile` | Ruby gem 依存関係 |
| `package.json` | npm パッケージ（React, esbuild等） |
| `setup.sh` | 自動セットアップスクリプト |
| `docker-setup-instructions.md` | Docker 詳細ガイド |

---

## 🌐 サービスポート一覧

| サービス | ポート | URL | 用途 |
|---|---|---|---|
| Rails | 3000 | http://localhost:3000 | メインアプリ |
| Sidekiq UI | 8080 | http://localhost:8080 | バックグラウンドジョブ管理 |
| PostgreSQL | 5432 | localhost:5432 | データベース |
| Redis | 6379 | localhost:6379 | キャッシュ・ジョブキュー |

---

## 📝 環境変数の管理

### .env ファイルの場所
```
/Users/yudai/Projects/callnote/.env
```

### 主要な環境変数
```bash
# 開発用
RAILS_ENV=development
DATABASE_URL=postgresql://callnote_user:callnote_password@db:5432/callnote_development
REDIS_URL=redis://redis:6379

# API キー（必要に応じて設定）
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# 秘密鍵
SECRET_KEY_BASE=...
```

---

## 🔧 うまくいかない時の対処

**症状**: React コンポーネントが表示されない  
**対応**: 
```bash
docker-compose exec web npm run build
docker-compose restart web
```

**症状**: Sidekiq ジョブが実行されない  
**対応**:
```bash
# Redis 接続確認
docker-compose exec redis redis-cli ping

# Sidekiq ログ確認
docker-compose logs sidekiq
```

**症状**: 「Permission denied」エラー  
**対応**:
```bash
# 権限修正
docker-compose exec web chown -R 1000:1000 /app
```

---

## ✨ 次に構築する機能

1. **Rails モデル/コントローラ**
   - `User` モデル（Devise）
   - `Call` モデル（音声ファイル）
   - REST API エンドポイント

2. **React コンポーネント**
   - `CallApp` ルートコンポーネント
   - `CallUploader` ファイルアップロード
   - `CallList` 通話リスト表示
   - `AudioPlayer` 音声プレイヤー

3. **外部 API 統合**
   - Whisper API（文字起こし）
   - Claude API（要約）
   - Sidekiq ジョブ処理

4. **デプロイ**
   - GitHub Actions CI/CD
   - Render/Railway/Heroku への本番デプロイ

---

## 📚 参考ドキュメント

- [call_app_spec.md](call_app_spec.md) - 仕様書
- [docker-setup-instructions.md](docker-setup-instructions.md) - Docker 詳細ガイド
- [STEP_01_Rails初期化.md](STEP_01_Rails初期化.md) - 各段階ガイド
- [SETUP_PROMPT_FOR_CLAUDE_CODE.md](SETUP_PROMPT_FOR_CLAUDE_CODE.md) - Claude Code プロンプト

---

## 📞 サポート

Docker セットアップに関する問題は：

1. [docker-setup-instructions.md](docker-setup-instructions.md) のトラブルシューティングセクション参照
2. `docker-compose logs` で詳細なエラーメッセージ確認
3. `.env` ファイルの環境変数設定を確認

---

**セットアップ完了日時**: 2026年4月29日 15:52  
**ステータス**: ✅ 基本環境構築完了 / ⏳ サービス起動確認待機中

次は **Rails コントローラ・モデルの実装** に進めます。
