class SummarizeJob < ApplicationJob
  queue_as :default

  def perform(call_id)
    call = Call.find(call_id)
    return unless call.transcription.present?

    call.update(status: :summarizing)

    # TODO: Issue #13 で外部API（Groq）統合実装
    # 文字起こし結果を API に送信して要約生成
    # call.update(summary: result)

    call.update(status: :done)
  rescue StandardError => e
    Rails.logger.error("SummarizeJob failed for Call #{call_id}: #{e.message}")
    call&.update(status: :error)
    raise
  end
end
