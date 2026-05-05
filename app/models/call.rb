class Call < ApplicationRecord
  belongs_to :user
  has_one_attached :audio, dependent: :destroy

  enum :status, %w[pending transcribing summarizing done error]

  validates :title, presence: true
  validates :audio, presence: true, on: :create
  validates :user_id, presence: true

  scope :recent, -> { order(created_at: :desc) }

  def audio_url
    return nil unless audio.attached?
    Rails.application.routes.url_helpers.rails_blob_path(audio, only_path: true)
  end

  def audio_filename
    audio.filename.to_s if audio.attached?
  end
end
