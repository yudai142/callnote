require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
  end

  describe 'associations' do
    it { is_expected.to have_many(:calls).dependent(:destroy) }
  end

  describe 'user registration' do
    let(:user_attributes) do
      {
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123'
      }
    end

    it 'creates a new user with valid attributes' do
      user = User.new(user_attributes)
      expect(user.save).to be_truthy
    end

    it 'fails to create user without email' do
      user = User.new(password: 'password123', password_confirmation: 'password123')
      expect(user.save).to be_falsy
      expect(user.errors[:email]).to be_present
    end

    it 'fails to create user without password' do
      user = User.new(email: 'test@example.com')
      expect(user.save).to be_falsy
      expect(user.errors[:password]).to be_present
    end

    it 'fails to create user with mismatched password confirmation' do
      user = User.new(
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'different'
      )
      expect(user.save).to be_falsy
      expect(user.errors[:password_confirmation]).to be_present
    end

    it 'fails to create duplicate user with same email' do
      User.create!(user_attributes)
      duplicate_user = User.new(user_attributes)
      expect(duplicate_user.save).to be_falsy
      expect(duplicate_user.errors[:email]).to be_present
    end
  end

  describe 'password' do
    let(:user) { User.create!(email: 'test@example.com', password: 'password123', password_confirmation: 'password123') }

    it 'encrypts password' do
      expect(user.encrypted_password).not_to be_blank
      expect(user.encrypted_password).not_to eq('password123')
    end

    it 'authenticates user with correct password' do
      expect(user.valid_password?('password123')).to be_truthy
    end

    it 'does not authenticate with incorrect password' do
      expect(user.valid_password?('wrongpassword')).to be_falsy
    end
  end
end
