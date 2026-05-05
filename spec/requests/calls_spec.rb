require "rails_helper"

RSpec.describe "Calls API", type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }

  describe "GET /calls (index)" do
    context "when authenticated" do
      it "returns user's calls" do
        call = create(:call, user: user)
        create(:call, user: other_user)

        sign_in user
        get "/calls"

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body.length).to eq(1)
        expect(body[0]["id"]).to eq(call.id)
        expect(body[0]).to include("title", "status", "audio_url")
      end

      it "returns calls in recent order" do
        call1 = create(:call, user: user, created_at: 2.days.ago)
        call2 = create(:call, user: user, created_at: 1.day.ago)
        call3 = create(:call, user: user, created_at: Time.current)

        sign_in user
        get "/calls"

        body = JSON.parse(response.body)
        expect(body.map { |c| c["id"] }).to eq([call3.id, call2.id, call1.id])
      end
    end

    context "when not authenticated" do
      it "returns 401 Unauthorized" do
        get "/calls"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /calls (create)" do
    context "when authenticated" do
      it "creates a new call" do
        sign_in user

        expect {
          post "/calls", params: {
            call: {
              title: "Test Call",
              started_at: 1.hour.ago,
              ended_at: Time.current,
              audio: fixture_file_upload("test_audio.wav", "audio/wav")
            }
          }
        }.to change(Call, :count).by(1)

        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body["title"]).to eq("Test Call")
        expect(body).to have_key("id")
      end

      it "returns error when audio is missing" do
        sign_in user

        post "/calls", params: {
          call: {
            title: "Test Call"
          }
        }

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body["errors"]).to be_present
      end

      it "associates call with current user" do
        sign_in user

        post "/calls", params: {
          call: {
            title: "Test Call",
            audio: fixture_file_upload("test_audio.wav", "audio/wav")
          }
        }

        call = Call.last
        expect(call.user_id).to eq(user.id)
      end
    end

    context "when not authenticated" do
      it "returns 401 Unauthorized" do
        post "/calls", params: { call: { title: "Test" } }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /calls/:id (show)" do
    context "when authenticated" do
      it "returns the call" do
        call = create(:call, user: user)
        sign_in user

        get "/calls/#{call.id}"

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["id"]).to eq(call.id)
        expect(body["title"]).to eq(call.title)
      end

      it "returns 404 when call not found" do
        sign_in user
        get "/calls/99999"
        expect(response).to have_http_status(:not_found)
      end

      it "returns 404 when call belongs to other user" do
        call = create(:call, user: other_user)
        sign_in user

        get "/calls/#{call.id}"
        expect(response).to have_http_status(:not_found)
      end
    end

    context "when not authenticated" do
      it "returns 401 Unauthorized" do
        call = create(:call, user: user)
        get "/calls/#{call.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /calls/:id (destroy)" do
    context "when authenticated" do
      it "deletes the call" do
        call = create(:call, user: user)
        sign_in user

        expect {
          delete "/calls/#{call.id}"
        }.to change(Call, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "returns 404 when call not found" do
        sign_in user
        delete "/calls/99999"
        expect(response).to have_http_status(:not_found)
      end

      it "returns 404 when call belongs to other user" do
        call = create(:call, user: other_user)
        sign_in user

        delete "/calls/#{call.id}"
        expect(response).to have_http_status(:not_found)
        expect(Call.exists?(call.id)).to be true
      end
    end

    context "when not authenticated" do
      it "returns 401 Unauthorized" do
        call = create(:call, user: user)
        delete "/calls/#{call.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "GET /calls/:id/audio (download)" do
    context "when authenticated" do
      it "redirects to audio blob" do
        call = create(:call, user: user)
        sign_in user

        get "/calls/#{call.id}/audio"

        expect(response).to have_http_status(:redirect)
      end

      it "returns 404 when call not found" do
        sign_in user
        get "/calls/99999/audio"
        expect(response).to have_http_status(:not_found)
      end

      it "returns 404 when call belongs to other user" do
        call = create(:call, user: other_user)
        sign_in user

        get "/calls/#{call.id}/audio"
        expect(response).to have_http_status(:not_found)
      end
    end

    context "when not authenticated" do
      it "returns 401 Unauthorized" do
        call = create(:call, user: user)
        get "/calls/#{call.id}/audio"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
