require "rails_helper"

RSpec.describe TranscribeJob, type: :job do
  let(:user) { create(:user) }

  describe "#perform" do
    it "enqueues the job" do
      expect {
        TranscribeJob.perform_later(1)
      }.to have_enqueued_job(TranscribeJob).with(1)
    end

    it "uses critical queue" do
      expect {
        TranscribeJob.perform_later(1)
      }.to have_enqueued_job(TranscribeJob).on_queue("critical")
    end

    it "raises error when call not found" do
      expect {
        TranscribeJob.perform_now(99999)
      }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
