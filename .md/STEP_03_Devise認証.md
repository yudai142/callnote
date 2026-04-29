# STEP 3: Devise 認証・ユーザー管理

## 目的
ユーザー登録・ログイン・ログアウト機能を Devise で実装する。

## インストール
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

## ファイル修正

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

## ビューファイル確認
```bash
# Devise ビュー自動生成
rails generate devise:views

# 確認
ls app/views/devise/
```

## テスト方法
```bash
rails s -p 3000

# 1. http://localhost:3000 にアクセス → ログイン画面へリダイレクト
# 2. "Sign up" で新規登録
# 3. email / password を入力 → ダッシュボードへ
# 4. "Sign out" でログアウト
```

## 次のステップ
→ [STEP 4: React・JavaScript ビルドシステム設定](STEP_04_Reactビルドシステム.md)
