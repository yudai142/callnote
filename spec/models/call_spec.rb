require 'rails_helper'

RSpec.describe Call, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_one_attached(:audio) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:user_id) }
  end

  describe "factory" do
    it "creates a valid call" do
      call = create(:call)
      expect(call).to be_valid
      expect(call).to be_persisted
    end
  end

  describe "status enum" do
    it "has correct status enum values" do
      expect(Call.statuses.keys).to match_array(["pending", "transcribing", "summarizing", "done", "error"])
    end
  end
end
