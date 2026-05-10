# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]

  # POST /resource
  def create
    # JSON リクエストの場合のみ処理
    return handle_json_request unless json_request?

    build_resource(sign_up_params)

    if resource.save
      sign_up(resource_name, resource)
      redirect_to root_path, notice: 'アカウントを作成しました'
    else
      flash[:alert] = resource.errors.full_messages.join(', ')
      render :new
    end
  end

  private

  def json_request?
    request.format.json? || request.content_type&.include?('application/json')
  end

  def handle_json_request
    build_resource(sign_up_params)

    if resource.save
      sign_up(resource_name, resource)
      render json: { success: true, user: resource }, status: :created
    else
      render json: { success: false, errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  protected

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [:email, :password, :password_confirmation])
  end
end
