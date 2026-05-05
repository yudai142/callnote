class User < ApplicationRecord
  has_many :calls, dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :encrypted_password, presence: true
end
