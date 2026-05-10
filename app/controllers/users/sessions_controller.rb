# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  before_action :configure_sign_in_params, only: [:create]
  respond_to :json

  # POST /resource/sign_in
  def create
    begin
      self.resource = warden.authenticate!(auth_options)
      set_flash_message(:notice, :signed_in)
      sign_in(resource_name, resource)

      if request.format.json?
        render json: { success: true, user: resource }, status: :ok
      else
        redirect_to root_path
      end
    rescue Warden::InvalidCredentials
      if request.format.json?
        render json: { success: false, errors: ['メールアドレスまたはパスワードが正しくありません'] }, status: :unauthorized
      else
        redirect_to new_user_session_path, alert: 'メールアドレスまたはパスワードが正しくありません'
      end
    end
  end

  # DELETE /resource/sign_out
  def destroy
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))

    if request.format.json?
      render json: { success: true }, status: :ok
    else
      redirect_to root_path, notice: 'ログアウトしました'
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
