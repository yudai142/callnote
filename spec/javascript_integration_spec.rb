require "rails_helper"

RSpec.describe "JavaScript Integration", type: :request do
  before(:each) do
    host! "localhost"
  end

  describe "React and importmap setup" do
    it "loads application.js in the page" do
      get "/"
      expect(response.body).to include("importmap")
    end

    it "includes compiled Tailwind CSS from assets" do
      get "/"
      expect(response.body).to include('href="/assets/application')
      expect(response.body).to include('.css')
    end

    it "includes React mount point" do
      get "/"
      expect(response.body).to include('id="react-app"')
    end
  end

  describe "Material Design setup" do
    it "includes Material Symbols font from CDN" do
      get "/"
      expect(response.body).to include("fonts.googleapis.com/css2?family=Material+Symbols+Outlined")
    end

    it "includes Google Fonts Inter and Noto Sans JP" do
      get "/"
      expect(response.body).to include("fonts.googleapis.com")
      expect(response.body).to include("Inter")
      expect(response.body).to include("Noto+Sans+JP")
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
