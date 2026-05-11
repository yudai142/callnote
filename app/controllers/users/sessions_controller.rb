# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  skip_before_action :verify_authenticity_token, if: :json_request?
  before_action :configure_sign_in_params, only: [:create]

  # POST /resource/sign_in
  def create
    I18n.locale = :ja
    # For JSON requests, use custom authentication logic
    if json_request?
      email = params[:user][:email]
      password = params[:user][:password]

      user = User.find_by(email: email)

      if user&.valid_password?(password)
        set_flash_message(:notice, :signed_in)
        sign_in(:user, user)
        render json: { success: true, user: { id: user.id, email: user.email } }, status: :ok
      else
        render json: { success: false, errors: ['メールアドレスまたはパスワードが正しくありません'] }, status: :unauthorized
      end
    else
      # HTML flow - use Devise default
      begin
        self.resource = warden.authenticate!(auth_options)
        set_flash_message(:notice, :signed_in)
        sign_in(resource_name, resource)
        redirect_to root_path
      rescue Warden::InvalidCredentials
        redirect_to new_user_session_path, alert: 'メールアドレスまたはパスワードが正しくありません'
      end
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
    # Check if request explicitly wants JSON
    request.format.json? ||
    request.content_type&.include?('application/json')
  end

  protected

  def configure_sign_in_params
    devise_parameter_sanitizer.permit(:sign_in, keys: [:email, :password])
  end

  def auth_options
    { scope: resource_name }
  end
end
