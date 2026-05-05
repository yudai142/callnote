require "rails_helper"

RSpec.describe SummarizeJob, type: :job do
  let(:user) { create(:user) }
  let(:call) { create(:call, user: user, status: :transcribing, transcription: "文字起こし済みテキスト") }
  let(:summary_text) { "- 会議の要点1\n- 会議の要点2" }

  describe "#perform" do
    it "ジョブをキューに投入する" do
      expect {
        SummarizeJob.perform_later(1)
      }.to have_enqueued_job(SummarizeJob).with(1)
    end

    it "default キューを使用する" do
      expect {
        SummarizeJob.perform_later(1)
      }.to have_enqueued_job(SummarizeJob).on_queue("default")
    end

    context "Call が存在しない場合" do
      it "例外を再 raise しない（discard_on）" do
        expect { SummarizeJob.perform_now(99999) }.not_to raise_error
      end
    end

    context "文字起こしテキストが存在する場合" do
      before do
        allow(GroqSummaryService).to receive(:call).with(call.transcription).and_return(summary_text)
      end

      it "要約を保存してステータスを done にする" do
        SummarizeJob.perform_now(call.id)
        call.reload
        expect(call.summary).to eq(summary_text)
        expect(call.status).to eq("done")
      end
    end

    context "文字起こしテキストが存在しない場合" do
      let(:call) { create(:call, user: user, status: :pending, transcription: nil) }

      it "要約処理をスキップする" do
        expect(GroqSummaryService).not_to receive(:call)
        SummarizeJob.perform_now(call.id)
      end
    end

    context "GroqSummaryService が ApiError を発生させる場合" do
      before do
        allow(GroqSummaryService).to receive(:call)
          .and_raise(GroqSummaryService::ApiError, "API エラー")
      end

      it "ステータスを error に設定する" do
        SummarizeJob.perform_now(call.id) rescue nil
        expect(call.reload.status).to eq("error")
      end
    end
  end
end
