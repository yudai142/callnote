require "rails_helper"

RSpec.describe TranscribeJob, type: :job do
  let(:user) { create(:user) }
  let(:call) { create(:call, user: user) }
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

      it "ジョブを実行する" do
        TranscribeJob.perform_now(call.id)
        expect(call.reload.transcription).to eq(transcription_text)
      end

      it "SummarizeJob をキューに投入する" do
        expect {
          TranscribeJob.perform_now(call.id)
        }.to have_enqueued_job(SummarizeJob).with(call.id)
      end
    end
  end
end
