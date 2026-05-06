# デプロイメントガイド - callnote

完全無料構成によるRender.comへのデプロイメント手順を説明します。

## 前提条件

- GitHub リポジトリが公開またはプライベートアクセス設定
- Neon、Upstash、Cloudinary、Render アカウント

## デプロイメント手順

### 1. 外部サービスのセットアップ

#### 1.1 Neon - PostgreSQL (無料・3GB)
```bash
# https://neon.tech でサインアップ
# プロジェクト作成後、Connection String を取得
# DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
```

#### 1.2 Upstash - Redis (無料)
```bash
# https://console.upstash.com でサインアップ
# Redis インスタンス作成後、Connection String を取得
# REDIS_URL=redis://default:password@xxx.upstash.io:xxxxx
```

#### 1.3 Cloudinary - ストレージ (無料・10GB)
```bash
# https://cloudinary.com でサインアップ
# ダッシュボードから以下を取得：
# CLOUDINARY_CLOUD_NAME=xxx
# CLOUDINARY_API_KEY=xxx
# CLOUDINARY_API_SECRET=xxx
```

#### 1.4 Groq API - LLM/Whisper (無料トライアル)
```bash
# https://console.groq.com でサインアップ
# API キーを生成：
# GROQ_API_KEY=gsk_xxx
```

### 2. Render.com でのデプロイ

#### 2.1 リポジトリを Render に接続
```bash
# 1. https://render.com にサインイン
# 2. "New +" → "Web Service"
# 3. GitHub リポジトリを選択
```

#### 2.2 環境変数を設定
Render ダッシュボードで以下を設定：

```
RAILS_ENV=production
RAILS_LOG_TO_STDOUT=true
SECRET_KEY_BASE=(bundle exec rails secret で生成)
DATABASE_URL=(Neon Connection String)
REDIS_URL=(Upstash Connection String)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
GROQ_API_KEY=gsk_xxx
```

#### 2.3 デプロイ設定
```yaml
# render.yaml が既に含まれているため、以下が自動適用：
- Build Command: ./bin/ci
- Start Command: bundle exec rails server -p 3000 -b 0.0.0.0
- Plan: Free (15分で自動スリープ)
```

### 3. デプロイ後の確認

```bash
# デプロイ完了後、以下を確認：
1. Render ダッシュボードでデプロイ状態確認
2. ログを確認（"Logs" タブ）
3. アプリ URL にアクセス
4. /up エンドポイント（ヘルスチェック）でステータス確認
```

## トラブルシューティング

### ビルド失敗
```
エラー: "bundle install failed"
解決: Gemfile.lock が最新か確認
$ bundle install
$ git add Gemfile.lock
$ git commit -m "Update Gemfile.lock"
```

### データベース接続エラー
```
エラー: "could not connect to server"
解決: DATABASE_URL が正しいか確認（sslmode=require を含む）
```

### ストレージアップロード失敗
```
エラー: "Cloudinary authentication failed"
解決: 環境変数（CLOUDINARY_* ）が正しく設定されているか確認
```

### Redis 接続エラー
```
エラー: "Redis::ConnectionError"
解決: REDIS_URL が正しいか確認（パスワードなしアクセスは許可されていない）
```

## ローカルでの本番環境テスト

```bash
# 本番環境設定で Docker ビルド・実行
$ docker build -t callnote .
$ docker run --env-file .env.production -p 3000:3000 callnote

# または docker-compose
$ RAILS_ENV=production docker-compose up
```

## コスト概算（2024年）

| サービス | 無料枠 | 制限 |
|---------|------|------|
| Render | $0 | 15分スリープ |
| Neon | $0 | 3GB / 3プロジェクト |
| Upstash | $0 | 接続数制限 |
| Cloudinary | $0 | 10GB ストレージ |
| Groq API | 無料トライアル | 従量課金 |
| **合計** | **月額 $0-5** | - |

## 本番運用への推奨

1. **エラートラッキング**: Sentry 統合（無料枠あり）
2. **モニタリング**: Render の Metrics タブ監視
3. **ログ管理**: CloudWatch または Logz.io
4. **バックアップ**: Neon 自動バックアップ（7日保持）
5. **有料プラン検討**: 無料版では 15 分で自動スリープするため、本格運用は Starter+ ($7/月) の利用を推奨

## デプロイメント後のチェックリスト

- [ ] ヘルスチェック（/up）が 200 を返す
- [ ] データベースマイグレーション完了
- [ ] 音声ファイルのアップロード・ダウンロードが動作
- [ ] 文字起こし・要約処理が実行される
- [ ] ログにエラーが出現していない
- [ ] Sidekiq バックグラウンドジョブが実行中（workers ページで確認）

## 参考リンク

- Render: https://docs.render.com/
- Neon: https://neon.tech/docs
- Upstash: https://upstash.com/docs
- Cloudinary: https://cloudinary.com/documentation
- Rails Deployment: https://guides.rubyonrails.org/configuring.html#deployment
