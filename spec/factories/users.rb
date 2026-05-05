FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    encrypted_password { "hashed_password_#{SecureRandom.hex(16)}" }
    sequence(:name) { |n| "User #{n}" }
  end
end
