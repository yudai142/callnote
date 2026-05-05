class TranscribeJob < ApplicationJob
  queue_as :critical

  def perform(call_id)
    call = Call.find(call_id)
    return unless call.audio.attached?

    call.update(status: :transcribing)

    # TODO: Issue #13 で外部API（Groq/Whisper）統合実装
    # 音声ファイルを API に送信して文字起こし
    # call.update(transcription: result)

    # 要約ジョブをキュー投入（実装後）
    # SummarizeJob.perform_later(call_id)
  rescue StandardError => e
    Rails.logger.error("TranscribeJob failed for Call #{call_id}: #{e.message}")
    call&.update(status: :error)
    raise
  end
end
