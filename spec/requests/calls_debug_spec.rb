require "rails_helper"

RSpec.describe "Calls API", type: :request do
  let(:user) { create(:user) }

  describe "GET /calls (index)" do
    it "returns user's calls with debug info" do
      sign_in user
      get "/calls", as: :json

      puts "Response status: #{response.status}"
      puts "Response body: #{response.body}"
      puts "User signed in: #{user_signed_in?}"
      puts "Current user: #{current_user.inspect}"
    end
  end
end
