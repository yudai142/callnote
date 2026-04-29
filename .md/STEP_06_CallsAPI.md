# STEP 6: Calls コントローラ・API エンドポイント

## 目的
REST API エンドポイント（index, create, show, destroy）を実装し、音声ファイルのアップロード・取得を可能にする。

## ファイル作成・修正

**`app/controllers/calls_controller.rb`**
```ruby
class CallsController < ApplicationController
  before_action :set_call, only: [:show, :destroy, :audio]
  
  def index
    @calls = current_user.calls.recent.as_json(methods: [:audio_url, :audio_filename])
    render json: @calls
  end

  def create
    @call = current_user.calls.build(call_params)

    if @call.save
      render json: @call.as_json(methods: [:audio_url, :audio_filename]), status: :created
    else
      render json: @call.errors, status: :unprocessable_entity
    end
  end

  def show
    render json: @call.as_json(methods: [:audio_url, :audio_filename])
  end

  def destroy
    @call.destroy!
    render json: { message: 'Call deleted' }, status: :ok
  end

  def audio
    if @call.audio.attached?
      send_data @call.audio.download, 
                filename: @call.audio_filename,
                type: @call.audio.content_type
    else
      render json: { error: 'Audio not found' }, status: :not_found
    end
  end

  private

  def set_call
    @call = current_user.calls.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Not found' }, status: :not_found
  end

  def call_params
    params.require(:call).permit(:title, :audio, :duration)
  end
end
```

**`config/routes.rb`** （更新）
```ruby
Rails.application.routes.draw do
  devise_for :users

  resources :calls, only: [:index, :create, :show, :destroy] do
    member do
      get :audio
    end
  end

  root 'calls#index'
end
```

## テスト方法（curl で）
```bash
# ユーザー登録・ログイン後、セッションクッキーを取得
# 例: cookie_value="your_session_cookie"

# 1. Callリスト取得
curl -X GET http://localhost:3000/calls \
  -H "Cookie: _callnote_session=cookie_value"

# 2. Call作成（音声ファイル付き）
curl -X POST http://localhost:3000/calls \
  -H "Cookie: _callnote_session=cookie_value" \
  -F "call[title]=Meeting 001" \
  -F "call[audio]=@/path/to/audio.m4a"

# 3. 音声ダウンロード
curl -X GET http://localhost:3000/calls/1/audio \
  -H "Cookie: _callnote_session=cookie_value" \
  -o downloaded_audio.m4a
```

## 次のステップ
→ [STEP 7: Sidekiq・非同期ジョブ設定](STEP_07_Sidekiq.md)
