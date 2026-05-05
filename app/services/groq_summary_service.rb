# Groq LLM API を使用して文字起こしテキストを要約するサービス
class GroqSummaryService
  # Groq API エラーの基底クラス
  class ApiError < StandardError; end

  GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
  # llama3-8b-8192 は高速・低コストで要約タスクに適したモデル
  LLM_MODEL = "llama3-8b-8192"

  # エントリポイント: 文字起こしテキストを受け取り要約文字列を返す
  def self.call(transcription)
    new(transcription).summarize
  end

  def initialize(transcription)
    @transcription = transcription
  end

  def summarize
    uri = URI(GROQ_API_URL)
    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = "Bearer #{groq_api_key}"
    request["Content-Type"] = "application/json"
    request.body = request_body

    response = http_client(uri).request(request)
    handle_response(response)
  end

  private

  def request_body
    JSON.generate({
      model: LLM_MODEL,
      messages: [
        {
          role: "system",
          content: "あなたは通話内容を簡潔に要約するアシスタントです。重要なポイントを箇条書きで日本語でまとめてください。"
        },
        {
          role: "user",
          content: "以下の通話内容を要約してください:\n\n#{@transcription}"
        }
      ],
      max_tokens: 1024,
      temperature: 0.3
    })
  end

  def handle_response(response)
    unless response.is_a?(Net::HTTPSuccess)
      raise ApiError, "Groq 要約 API エラー: #{response.code} #{response.body}"
    end

    parsed = JSON.parse(response.body)
    # OpenAI 互換レスポンス形式から content を抽出
    parsed.dig("choices", 0, "message", "content")&.strip ||
      raise(ApiError, "Groq API レスポンスに content が含まれていません")
  end

  def http_client(uri)
    Net::HTTP.new(uri.host, uri.port).tap do |http|
      http.use_ssl = true
      http.read_timeout = 60
      http.open_timeout = 10
    end
  end

  def groq_api_key
    ENV.fetch("GROQ_API_KEY") { raise ApiError, "GROQ_API_KEY が設定されていません" }
  end
end
