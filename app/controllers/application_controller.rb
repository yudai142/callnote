class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # CSRF protection: skip for API requests and tests
  protect_from_forgery unless: :api_or_test_request?

  protected

  def authenticate_user_api!
    return if user_signed_in?

    render json: { error: "認証が必要です" }, status: :unauthorized and return
  end

  private

  def api_or_test_request?
    json_request? || test_request?
  end

  def json_request?
    request.format.json? || request.content_type&.include?("application/json") || request.path.start_with?("/calls")
  end

  def test_request?
    Rails.env.test?
  end
end
