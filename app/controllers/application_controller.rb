class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  protected

  def authenticate_user_api!
    return if user_signed_in?

    render json: { error: "認証が必要です" }, status: :unauthorized and return
  end
end
