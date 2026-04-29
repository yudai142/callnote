# STEP 10: デプロイ・最適化・テスト

## 目的
本番環境へのデプロイ準備、パフォーマンス最適化、テストスイート構築を行う。

## 1. テストスイート構築

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

## 2. 本番環境設定

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

## 3. Dockerfile & Docker Compose

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

## 4. GitHub Actions CI/CD

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

## 5. パフォーマンス最適化

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

## テスト実行
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

## デプロイ（例: Render）
```bash
# 1. Git push
git push origin main

# 2. Render Dashboard でデプロイ実行
# 環境変数設定済みの場合、自動デプロイ

# 3. DB マイグレーション確認
# Render コンソール で rails db:migrate 実行
```

## 最終チェックリスト
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

## トラブルシューティング

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

## 参考資料

- [Rails 公式ガイド](https://guides.rubyonrails.org/)
- [React 公式ドキュメント](https://react.dev/)
- [Devise README](https://github.com/heartcombo/devise)
- [Sidekiq 公式](https://sidekiq.org/)
- [OpenAI Ruby Gem](https://github.com/alexrudall/ruby-openai)
- [Anthropic Ruby SDK](https://github.com/anthropics/anthropic-sdk-python)
