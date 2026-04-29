source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

# Rails
gem "rails", "~> 7.0.0"
gem "pg", "~> 1.1"
gem "puma", "~> 5.0"

# JavaScript/CSS
gem "jsbundling-rails"
gem "cssbundling-rails"
gem "sprockets-rails"

# React
gem "react-rails"

# CSS Framework
# gem "bootstrap", "~> 5.1.3"
# gem "tailwindcss-rails"

# Authentication
gem "devise"

# Background jobs
gem "sidekiq", "~> 7.0"
gem "redis", "~> 5.0"

# API clients
gem "ruby-openai"
gem "anthropic"

# CORS
gem "rack-cors"

# Storage
gem "aws-sdk-s3", require: false

# Environment variables
gem "dotenv-rails", groups: [:development, :test]

# Monitoring/Logging
# gem "sentry-rails"

group :development, :test do
  # Testing
  gem "rspec-rails"
  gem "factory_bot_rails"
  gem "faker"
  gem "shoulda-matchers", "~> 5.0"

  # Linting
  gem "rubocop", require: false
  gem "rubocop-rails", require: false
  gem "eslint-rails"
end

group :development do
  # Debugging
  gem "byebug", platforms: [:mri, :mingw, :x64_mingw]
  gem "web-console"
  gem "listen", "~> 3.3"

  # Code quality
  gem "bullet"
end

group :test do
  # Testing
  gem "capybara", ">= 3.26"
  gem "selenium-webdriver", ">= 4.0.0.rc1"
  gem "webdrivers"
end
