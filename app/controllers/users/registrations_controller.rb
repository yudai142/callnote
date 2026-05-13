# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  skip_before_action :verify_authenticity_token, if: :json_request?
  before_action :configure_sign_up_params, only: [ :create ]

  # POST /resource
  def create
    # JSON リクエストの場合、JSON レスポンスを返す
    return handle_json_request if json_request?

    build_resource(sign_up_params)

    if resource.save
      sign_up(resource_name, resource)
      redirect_to root_path, notice: "\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u4F5C\u6210\u3057\u307E\u3057\u305F"
    else
      flash[:alert] = resource.errors.full_messages.join(", ")
      render :new
    end
  end

  private

  def json_request?
    request.format.json? || request.content_type&.include?("application/json")
  end

  def handle_json_request
    I18n.locale = :ja
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
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :email, :password, :password_confirmation ])
  end
end
