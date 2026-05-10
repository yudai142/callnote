# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  before_action :configure_sign_in_params, only: [:create]

  # POST /resource/sign_in
  def create
    # JSON リクエストの場合、JSON レスポンスを返す
    return handle_json_login if json_request?

    begin
      self.resource = warden.authenticate!(auth_options)
      set_flash_message(:notice, :signed_in)
      sign_in(resource_name, resource)
      redirect_to root_path
    rescue Warden::InvalidCredentials
      redirect_to new_user_session_path, alert: 'メールアドレスまたはパスワードが正しくありません'
    end
  end

  # DELETE /resource/sign_out
  def destroy
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))

    if json_request?
      render json: { success: true }, status: :ok
    else
      redirect_to root_path, notice: 'ログアウトしました'
    end
  end

  private

  def json_request?
    request.format.json? || request.content_type&.include?('application/json')
  end

  def handle_json_login
    begin
      self.resource = warden.authenticate!(auth_options)
      set_flash_message(:notice, :signed_in)
      sign_in(resource_name, resource)
      render json: { success: true, user: resource }, status: :ok
    rescue Warden::InvalidCredentials
      render json: { success: false, errors: ['メールアドレスまたはパスワードが正しくありません'] }, status: :unauthorized
    end
  end

  protected

  def configure_sign_in_params
    devise_parameter_sanitizer.permit(:sign_in, keys: [:email, :password])
  end

  def auth_options
    { scope: resource_name }
  end
end
