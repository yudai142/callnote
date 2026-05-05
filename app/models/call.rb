class Call < ApplicationRecord
  belongs_to :user
  has_one_attached :audio_file

  enum :status, %w[pending recording completed failed]

  validates :title, presence: true
  validates :status, presence: true
  validates :user_id, presence: true
end
