class SummarizeJob < ApplicationJob
  queue_as :default

  retry_on GroqSummaryService::ApiError, wait: :polynomially_longer, attempts: 3
  discard_on ActiveRecord::RecordNotFound

  def perform(call_id)
    call = Call.find(call_id)
    return unless call.transcription.present?

    call.update!(status: :summarizing)

    # Groq LLM API で要約を生成
    summary = GroqSummaryService.call(call.transcription)
    call.update!(summary: summary, status: :done)
  rescue StandardError => e
    Rails.logger.error("SummarizeJob 失敗 Call##{call_id}: #{e.class} #{e.message}")
    call&.update(status: :error)
    raise
  end
end
