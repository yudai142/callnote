require "rails_helper"

RSpec.describe "JavaScript Integration", type: :request do
  describe "React and importmap setup" do
    it "loads application.js in the page" do
      get "/"
      expect(response.body).to include("importmap")
    end

    it "includes Tailwind CSS from CDN" do
      get "/"
      expect(response.body).to include("cdn.tailwindcss.com")
    end

    it "includes React mount point" do
      get "/"
      expect(response.body).to include('id="react-app"')
    end
  end

  describe "importmap configuration" do
    it "has React pinned in importmap" do
      importmap_config = Rails.root.join("config/importmap.rb").read
      expect(importmap_config).to include("react")
      expect(importmap_config).to include("react-dom")
    end
  end
end
