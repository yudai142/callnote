require "rails_helper"

RSpec.describe "Call Audio Attachment", type: :model do
  let(:user) { User.create!(email: "test@example.com", password: "password123", password_confirmation: "password123") }

  describe "audio attachment" do
    it "has one audio attached" do
      call = build(:call, user: user)
      expect(call).to have_one_attached(:audio)
    end

    it "requires audio on create" do
      call = build(:call, user: user)
      expect(call).to validate_presence_of(:audio).on(:create)
    end

    it "provides audio URL" do
      call = create(:call, user: user)
      expect(call.audio_url).to be_nil
    end

    it "provides audio filename" do
      call = create(:call, user: user)
      expect(call.audio_filename).to be_nil
    end
  end

  describe "status enum" do
    it "has correct status options" do
      expected_statuses = [ "pending", "transcribing", "summarizing", "done", "error" ]
      expect(Call.statuses.keys).to match_array(expected_statuses)
    end

    it "sets default status" do
      call = build(:call, user: user, status: "pending")
      expect(call.status).to eq("pending")
    end
  end

  describe "scope" do
    it "orders by recent" do
      call1 = create(:call, user: user, created_at: 2.days.ago)
      call2 = create(:call, user: user, created_at: 1.day.ago)
      call3 = create(:call, user: user, created_at: Time.current)

      expect(Call.recent).to eq([ call3, call2, call1 ])
    end
  end
end
