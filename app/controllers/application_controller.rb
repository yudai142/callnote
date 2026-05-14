class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern, block: :log

  # Disable CSRF verification in test environment or for JSON requests
  protect_from_forgery with: :exception, unless: :skip_csrf_verification?

  protected

  def authenticate_user_api!
    return if user_signed_in?

    render json: { error: "認証が必要です" }, status: :unauthorized and return
  end

  private

  def skip_csrf_verification?
    Rails.env.test? || json_request?
  end

  def json_request?
    request.format.json? || request.content_type&.include?("application/json") || request.path.start_with?("/calls")
  end
end
