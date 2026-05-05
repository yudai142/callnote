# Groq Whisper API を使用して音声ファイルを文字起こしするサービス
class GroqTranscriptionService
  # Groq API エラーの基底クラス
  class ApiError < StandardError; end

  GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
  # whisper-large-v3 は Groq でサポートされている最高精度モデル
  WHISPER_MODEL = "whisper-large-v3"

  # エントリポイント: Call インスタンスを受け取り文字起こし結果の文字列を返す
  def self.call(call)
    new(call).transcribe
  end

  def initialize(call)
    @call = call
  end

  def transcribe
    # 音声ブロブを一時ファイルにダウンロードして API に送信
    Tempfile.create(["audio", File.extname(@call.audio.filename.to_s)]) do |tmpfile|
      tmpfile.binmode
      @call.audio.download { |chunk| tmpfile.write(chunk) }
      tmpfile.rewind
      post_to_groq(tmpfile)
    end
  end

  private

  def post_to_groq(file)
    uri = URI(GROQ_API_URL)
    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{groq_api_key}"

    # multipart/form-data フォームデータを構築
    request.set_form(
      [
        ["model", WHISPER_MODEL],
        ["response_format", "text"],
        ["file", file, {
          filename: @call.audio.filename.to_s,
          content_type: @call.audio.content_type || "audio/wav"
        }]
      ],
      "multipart/form-data"
    )

    response = http_client(uri).request(request)
    handle_response(response)
  end

  def handle_response(response)
    unless response.is_a?(Net::HTTPSuccess)
      raise ApiError, "Groq 文字起こし API エラー: #{response.code} #{response.body}"
    end
    # response_format: "text" の場合、レスポンスボディがそのまま文字起こし結果
    response.body.strip
  end

  def http_client(uri)
    Net::HTTP.new(uri.host, uri.port).tap do |http|
      http.use_ssl = true
      http.read_timeout = 120
      http.open_timeout = 10
    end
  end

  def groq_api_key
    ENV.fetch("GROQ_API_KEY") { raise ApiError, "GROQ_API_KEY が設定されていません" }
  end
end
