# Production process definitions
# For use with Render.com, Heroku, or similar platforms

web: bundle exec rails server -p 3000 -b 0.0.0.0
worker: bundle exec sidekiq -e production -C config/sidekiq.yml
release: bundle exec rails db:migrate
