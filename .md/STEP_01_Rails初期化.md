# STEP 1: Rails プロジェクト初期化

## 目的
Rails 7.x プロジェクトをゼロから作成し、基本的なプロジェクト構造を確立する。

## 前提条件
```bash
ruby --version          # >= 3.2
node --version          # >= 18
postgres --version      # 実行中
redis-cli --version     # 実行中（Sidekiq用）
```

## 実行コマンド
```bash
# 1. 新規Railsプロジェクト作成（APIモードではなく通常モード）
rails new callnote --database=postgresql --skip-test --skip-spring

cd callnote

# 2. bundle install
bundle install

# 3. DB作成
rails db:create
```

## ファイル確認
```bash
# config/database.yml が生成されたか確認
cat config/database.yml | grep -A 5 "development:"
```

## テスト方法
```bash
rails s -p 3000
# ブラウザで http://localhost:3000 にアクセス
# "Yay! You're on Rails!" が表示されたらOK
```

## 次のステップ
→ [STEP 2: データモデル・マイグレーション設計](STEP_02_データモデル.md)
