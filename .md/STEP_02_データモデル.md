# STEP 2: データモデル・マイグレーション設計

## 目的
ユーザー・通話データベーススキーマを設計し、マイグレーションを実行する。

## 実行コマンド
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

## ファイル追加・修正

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

## テスト方法
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

## 次のステップ
→ [STEP 3: Devise 認証・ユーザー管理](STEP_03_Devise認証.md)
