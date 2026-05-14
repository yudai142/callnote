class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Skip CSRF verification for API endpoints or when JSON request
  protect_from_forgery with: :null_session, unless: :json_request?

  protected

  def authenticate_user_api!
    return if user_signed_in?

    render json: { error: "認証が必要です" }, status: :unauthorized and return
  end

  private

  def json_request?
    request.format.json? || request.content_type&.include?("application/json")
  end
end
