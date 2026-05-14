class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern, block: :log

  # CSRF protection: disable in test environment and for JSON requests
  protect_from_forgery with: :null_session, if: :should_protect_from_forgery?

  protected

  def authenticate_user_api!
    return if user_signed_in?

    render json: { error: "認証が必要です" }, status: :unauthorized and return
  end

  private

  def should_protect_from_forgery?
    !Rails.env.test? && !json_request?
  end

  def json_request?
    request.format.json? || request.content_type&.include?("application/json") || request.path.start_with?("/calls")
  end
end
