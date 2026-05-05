require "rails_helper"

RSpec.describe TranscribeJob, type: :job do
  let(:user) { create(:user) }
  let(:call) { create(:call, user: user, status: :pending) }
  let(:transcription_text) { "テスト文字起こし結果" }

  describe "#perform" do
    it "ジョブをキューに投入する" do
      expect {
        TranscribeJob.perform_later(1)
      }.to have_enqueued_job(TranscribeJob).with(1)
    end

    it "critical キューを使用する" do
      expect {
        TranscribeJob.perform_later(1)
      }.to have_enqueued_job(TranscribeJob).on_queue("critical")
    end

    context "Call が存在しない場合" do
      it "例外を再 raise しない（discard_on）" do
        expect { TranscribeJob.perform_now(99999) }.not_to raise_error
      end
    end

    context "音声ファイルが添付されている場合" do
      before do
        allow(GroqTranscriptionService).to receive(:call).with(call).and_return(transcription_text)
      end

      it "ステータスを transcribing に更新する" do
        TranscribeJob.perform_now(call.id)
        expect(call.reload.status).to eq("transcribing")
      end

      it "文字起こし結果を保存する" do
        TranscribeJob.perform_now(call.id)
        expect(call.reload.transcription).to eq(transcription_text)
      end

      it "SummarizeJob をキューに投入する" do
        expect {
          TranscribeJob.perform_now(call.id)
        }.to have_enqueued_job(SummarizeJob).with(call.id)
      end
    end

    context "GroqTranscriptionService が ApiError を発生させる場合" do
      before do
        allow(GroqTranscriptionService).to receive(:call)
          .and_raise(GroqTranscriptionService::ApiError, "API エラー")
      end

      it "ステータスを error に設定する" do
        TranscribeJob.perform_now(call.id) rescue nil
        expect(call.reload.status).to eq("error")
      end
    end
  end
end
