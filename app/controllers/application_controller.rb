class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern, block: :log

  # Skip CSRF verification in test environment
  skip_before_action :verify_authenticity_token, if: -> { Rails.env.test? }
  # Skip CSRF verification for JSON/API requests
  skip_before_action :verify_authenticity_token, if: :json_request?

  protected

  def authenticate_user_api!
    return if user_signed_in?

    render json: { error: "認証が必要です" }, status: :unauthorized and return
  end

  private

  def json_request?
    request.format.json? || request.content_type&.include?("application/json") || request.path.start_with?("/calls")
  end
end
