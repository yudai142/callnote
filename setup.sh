#!/bin/bash

################################################################################
# Rails + React 通話文字起こし・要約アプリ Docker セットアップスクリプト
# 対応OS: macOS, Linux
# 必須: Docker, Docker Compose
################################################################################

set -e

# ===== カラー定義 =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ===== ログ関数 =====
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

# ===== 前提条件チェック =====
check_prerequisites() {
  log_info "前提条件を確認しています..."
  
  # Docker チェック
  if ! command -v docker &> /dev/null; then
    log_error "Docker がインストールされていません"
    echo "インストール方法: https://docs.docker.com/get-docker/"
    exit 1
  fi
  log_success "Docker がインストール済み"
  
  # Docker Compose チェック
  if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose がインストールされていません"
    echo "インストール方法: https://docs.docker.com/compose/install/"
    exit 1
  fi
  log_success "Docker Compose がインストール済み"
  
  # Docker デーモン起動確認
  if ! docker ps > /dev/null 2>&1; then
    log_error "Docker デーモンが起動していません"
    echo "Docker Desktop を起動してください"
    exit 1
  fi
  log_success "Docker デーモンが起動中"
}

# ===== ディレクトリ確認/作成 =====
setup_project_directory() {
  log_info "プロジェクトディレクトリをセットアップしています..."
  
  # 既存プロジェクト確認
  if [ -f "Gemfile" ]; then
    log_warning "既に Rails プロジェクトが存在します"
    read -p "続行しますか？ (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log_info "セットアップをキャンセルしました"
      exit 0
    fi
  else
    log_info "新規 Rails プロジェクトを作成します..."
    
    # Dockerfile で Rails プロジェクト作成（web コンテナ内で実行）
    log_info "Docker busybox でディレクトリを準備中..."
    mkdir -p storage log tmp
  fi
  
  log_success "プロジェクトディレクトリは有効です"
}

# ===== 環境変数ファイル作成 =====
setup_env_file() {
  log_info "環境変数ファイルをセットアップしています..."
  
  if [ -f ".env" ]; then
    log_warning ".env ファイルが既に存在します"
  else
    log_info ".env ファイルを作成します..."
    
    # ユーザーに API キーの入力を促す
    echo ""
    echo "=== API キー設定 ==="
    echo "以下の API キーを入力してください（スキップ可能）"
    echo ""
    
    read -p "OpenAI API Key (スキップ: Enter キー): " openai_key
    read -p "Anthropic API Key (スキップ: Enter キー): " anthropic_key
    
    # .env ファイル作成
    cat > .env << EOF
# Rails 環境
RAILS_ENV=development

# Database
DATABASE_URL=postgresql://callnote_user:callnote_password@db:5432/callnote_development

# Redis
REDIS_URL=redis://redis:6379

# External APIs
OPENAI_API_KEY=${openai_key:-sk-placeholder}
ANTHROPIC_API_KEY=${anthropic_key:-sk-ant-placeholder}

# Rails Secret
SECRET_KEY_BASE=$(openssl rand -hex 64)
EOF
    
    log_success ".env ファイルを作成しました"
  fi
}

# ===== Dockerfile & docker-compose 確認 =====
check_docker_files() {
  log_info "Docker ファイルを確認しています..."
  
  if [ ! -f "Dockerfile" ]; then
    log_warning "Dockerfile が見つかりません"
    echo "call_app_spec.md の Docker セクションから Dockerfile をコピーしてください"
    return 1
  fi
  log_success "Dockerfile が存在します"
  
  if [ ! -f "docker-compose.yml" ]; then
    log_warning "docker-compose.yml が見つかりません"
    echo "call_app_spec.md の Docker セクションから docker-compose.yml をコピーしてください"
    return 1
  fi
  log_success "docker-compose.yml が存在します"
  
  return 0
}

# ===== Docker コンテナ起動 =====
start_docker_containers() {
  log_info "Docker コンテナを起動しています..."
  
  # 既存コンテナ停止
  log_info "既存コンテナを停止します..."
  docker-compose down || true
  
  # コンテナ起動
  log_info "コンテナを起動中... (初回は数分かかります)"
  docker-compose up -d
  
  # サービス起動待機
  log_info "サービスの起動を待機中..."
  sleep 10
  
  # ヘルスチェック
  log_info "ヘルスチェックを実行中..."
  
  # PostgreSQL 確認
  max_attempts=30
  attempt=0
  while [ $attempt -lt $max_attempts ]; do
    if docker-compose exec -T db pg_isready -U callnote_user > /dev/null 2>&1; then
      log_success "PostgreSQL が起動しました"
      break
    fi
    attempt=$((attempt + 1))
    log_info "PostgreSQL 起動待機中... ($attempt/$max_attempts)"
    sleep 2
  done
  
  if [ $attempt -eq $max_attempts ]; then
    log_error "PostgreSQL の起動がタイムアウトしました"
    docker-compose logs db
    exit 1
  fi
  
  # Redis 確認
  if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    log_success "Redis が起動しました"
  else
    log_error "Redis の起動を確認できません"
    docker-compose logs redis
    exit 1
  fi
}

# ===== DB 初期化 =====
setup_database() {
  log_info "Database を初期化しています..."
  
  # DB 作成がまだなら作成
  log_info "DB を準備中..."
  docker-compose exec -T web bundle exec rails db:create || true
  
  log_info "マイグレーションを実行中..."
  docker-compose exec -T web bundle exec rails db:migrate || log_warning "マイグレーション失敗またはまだ定義されていません"
  
  log_success "Database 初期化完了"
}

# ===== React ビルド =====
build_react() {
  log_info "React をビルド中..."
  
  docker-compose exec -T web npm run build 2>/dev/null || log_warning "npm ビルド失敗またはコマンド未実行"
  
  log_success "React ビルド完了"
}

# ===== セットアップ完了メッセージ =====
print_completion_message() {
  echo ""
  echo "==============================================="
  echo -e "${GREEN}✅ Docker セットアップが完了しました！${NC}"
  echo "==============================================="
  echo ""
  echo -e "${BLUE}🚀 アクセス方法:${NC}"
  echo "  • Rails App: http://localhost:3000"
  echo "  • Sidekiq Web UI: http://localhost:8080"
  echo ""
  echo -e "${BLUE}📝 主要なコマンド:${NC}"
  echo "  • ログ確認: docker-compose logs -f web"
  echo "  • Rails console: docker-compose exec web bundle exec rails console"
  echo "  • DB console: docker-compose exec db psql -U callnote_user -d callnote_development"
  echo "  • コンテナ停止: docker-compose down"
  echo "  • コンテナ削除（DB含む）: docker-compose down -v"
  echo ""
  echo -e "${BLUE}🔧 次のステップ:${NC}"
  echo "  1. http://localhost:3000 でアプリにアクセス"
  echo "  2. Devise でユーザー登録 / ログイン"
  echo "  3. 音声ファイルをアップロードしてテスト"
  echo ""
  echo -e "${YELLOW}⚠️  重要:${NC}"
  echo "  • API キーを .env に設定していない場合は、後から編集してください"
  echo "  • docker-compose restart で再起動できます"
  echo ""
}

# ===== メイン処理 =====
main() {
  echo "========================================"
  echo "Rails + React Docker セットアップ"
  echo "========================================"
  echo ""
  
  check_prerequisites
  setup_project_directory
  setup_env_file
  check_docker_files || exit 1
  start_docker_containers
  setup_database
  build_react
  
  print_completion_message
  
  log_success "セットアップ完了！"
}

# ===== エントリーポイント =====
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  main "$@"
fi
