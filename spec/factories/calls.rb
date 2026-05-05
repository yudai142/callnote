FactoryBot.define do
  factory :call do
    user { association :user }
    sequence(:title) { |n| "Call #{n}" }
    status { :pending }
    transcription { Faker::Lorem.paragraphs(number: 3).join("\n") }
    summary { Faker::Lorem.paragraph }
    duration { rand(60..3600) }
    started_at { Time.current - 1.hour }
    ended_at { Time.current }
  end
end