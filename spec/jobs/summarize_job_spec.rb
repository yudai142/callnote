require "rails_helper"

RSpec.describe SummarizeJob, type: :job do
  describe "#perform" do
    it "enqueues the job" do
      expect {
        SummarizeJob.perform_later(1)
      }.to have_enqueued_job(SummarizeJob).with(1)
    end

    it "enqueues with default queue" do
      expect {
        SummarizeJob.perform_later(1)
      }.to have_enqueued_job(SummarizeJob).on_queue("default")
    end

    it "raises error when call not found" do
      expect {
        SummarizeJob.perform_now(99999)
      }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
