# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  before_action :configure_sign_up_params, only: [:create]

  # POST /resource
  def create
    build_resource(sign_up_params)

    resource.save
    if resource.persisted?
      sign_up(resource_name, resource)
      respond_to do |format|
        format.json { render json: { success: true, user: resource }, status: :created }
        format.html { redirect_to root_path, notice: 'アカウントを作成しました' }
      end
    else
      errors = resource.errors.full_messages
      respond_to do |format|
        format.json { render json: { success: false, errors: errors }, status: :unprocessable_entity }
        format.html do
          flash[:alert] = errors.join(', ')
          render :new
        end
      end
    end
  end

  protected

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [:email, :password, :password_confirmation])
  end
end
