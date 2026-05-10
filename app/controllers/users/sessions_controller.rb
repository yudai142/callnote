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
      render json: { success: true, user: resource }, status: :ok
    rescue Warden::InvalidCredentials
      render json: { success: false, errors: ['メールアドレスまたはパスワードが正しくありません'] }, status: :unauthorized
    end
  end

  # DELETE /resource/sign_out
  def destroy
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
    render json: { success: true }, status: :ok
  end

  protected

  def configure_sign_in_params
    devise_parameter_sanitizer.permit(:sign_in, keys: [:email, :password])
  end

  def auth_options
    { scope: resource_name }
  end
end
