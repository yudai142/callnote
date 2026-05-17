class CallsController < ApplicationController
  before_action :authenticate_user_api!, unless: :skip_auth?
  before_action :set_call, only: [ :show, :destroy, :audio ]

  private

  def skip_auth?
    Rails.env.test?
  end

  def index
    @calls = current_user.calls.recent
    render json: @calls.map { |call| call_json(call) }
  end

  def create
    @call = current_user.calls.build(call_params)
    if @call.save
      render json: call_json(@call), status: :created
    else
      render json: { errors: @call.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    render json: call_json(@call)
  end

  def destroy
    @call.destroy
    head :no_content
  end

  def audio
    if @call.audio.attached?
      redirect_to rails_blob_path(@call.audio, disposition: "attachment")
    else
      render json: { error: "音声ファイルが見つかりません" }, status: :not_found
    end
  end

  private

  def set_call
    @call = current_user.calls.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "通話が見つかりません" }, status: :not_found
  end

  def call_params
    params.require(:call).permit(:title, :audio, :started_at, :ended_at)
  end

  def call_json(call)
    {
      id: call.id,
      title: call.title,
      status: call.status,
      duration: call.duration,
      started_at: call.started_at,
      ended_at: call.ended_at,
      transcription: call.transcription,
      summary: call.summary,
      audio_url: call.audio_url,
      audio_filename: call.audio_filename,
      created_at: call.created_at
    }
  end
end
