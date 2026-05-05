require "rails_helper"

RSpec.describe SummarizeJob, type: :job do
  let(:user) { create(:user) }
  let(:call) { create(:call, user: user, transcription: "文字起こし済みテキスト") }
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

      it "要約を保存する" do
        SummarizeJob.perform_now(call.id)
        expect(call.reload.summary).to eq(summary_text)
      end
    end

    context "文字起こしテキストが存在しない場合" do
      let(:call) { create(:call, user: user, transcription: nil) }

      it "要約処理をスキップする" do
        expect(GroqSummaryService).not_to receive(:call)
        SummarizeJob.perform_now(call.id)
      end
    end

  end
end
