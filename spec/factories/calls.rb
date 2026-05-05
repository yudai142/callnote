FactoryBot.define do
  factory :call do
    association :user, strategy: :create
    sequence(:title) { |n| "Call #{n}" }
    status { "pending" }
    transcription { Faker::Lorem.paragraphs(number: 3).join("\n") }
    summary { Faker::Lorem.paragraph }
    duration { rand(60..3600) }
    started_at { Time.current - 1.hour }
    ended_at { Time.current }

    after(:build) do |call, evaluator|
      call.audio.attach(
        io: StringIO.new("fake audio data"),
        filename: "test_audio.wav",
        content_type: "audio/wav"
      ) if call.new_record?
    end

    after(:create) do |call, evaluator|
      call.audio.attach(
        io: StringIO.new("fake audio data"),
        filename: "test_audio.wav",
        content_type: "audio/wav"
      ) unless call.audio.attached?
    end
  end
end
