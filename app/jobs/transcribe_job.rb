class TranscribeJob < ApplicationJob
  queue_as :critical

  retry_on GroqTranscriptionService::ApiError, wait: :polynomially_longer, attempts: 3
  discard_on ActiveRecord::RecordNotFound

  def perform(call_id)
    call = Call.find(call_id)
    return unless call.audio.attached?

    call.update!(status: :transcribing)

    # Groq Whisper API で文字起こしを実行
    transcription = GroqTranscriptionService.call(call)
    call.update!(transcription: transcription)

    # 要約ジョブをキュー投入
    SummarizeJob.perform_later(call_id)
  rescue StandardError => e
    Rails.logger.error("TranscribeJob 失敗 Call##{call_id}: #{e.class} #{e.message}")
    call&.update(status: :error)
    raise
  end
end
