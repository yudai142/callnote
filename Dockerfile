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
COPY Gemfile Gemfile.lock* ./
RUN bundle install --retry 5

# npm パッケージのコピーとインストール
COPY package.json package-lock.json* ./
RUN npm install

# アプリケーションコードのコピー
COPY . .

# 本番環境用のアセットプリコンパイル（本番のみ実行）
# RUN RAILS_ENV=production bundle exec rails assets:precompile

EXPOSE 3000

CMD ["bundle", "exec", "rails", "s", "-b", "0.0.0.0"]
