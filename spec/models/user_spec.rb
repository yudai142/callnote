require 'rails_helper'

RSpec.describe User, type: :model do
  describe "associations" do
    it { is_expected.to have_many(:calls).dependent(:destroy) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email) }
    it { is_expected.to validate_presence_of(:encrypted_password) }
  end

  describe "factory" do
    it "creates a valid user" do
      user = build(:user)
      expect(user).to be_valid
    end
  end

  describe "email uniqueness" do
    let!(:existing_user) { create(:user, email: "test@example.com") }

    it "raises error when creating user with duplicate email" do
      expect { create(:user, email: "test@example.com") }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end
end
