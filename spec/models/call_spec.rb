require 'rails_helper'

RSpec.describe Call, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_one_attached(:audio_file) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:status) }
    it { is_expected.to validate_presence_of(:user_id) }
  end

  describe "enums" do
    it { is_expected.to define_enum_for(:status) }
  end

  describe "factory" do
    it "creates a valid call" do
      call = build(:call)
      expect(call).to be_valid
    end
  end

  describe "status enum" do
    let(:call) { build(:call) }

    it "has correct status values" do
      expect(Call.statuses).to include("pending", "recording", "completed", "failed")
    end

    it "can set status to pending" do
      call.pending!
      expect(call.pending?).to be true
    end

    it "can set status to recording" do
      call.recording!
      expect(call.recording?).to be true
    end

    it "can set status to completed" do
      call.completed!
      expect(call.completed?).to be true
    end

    it "can set status to failed" do
      call.failed!
      expect(call.failed?).to be true
    end
  end
end
