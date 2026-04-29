# Claude Code 用 セットアップ実行プロンプト

このファイルは、Claude.dev/Artifacts（Claude Code）で `call_app_spec.md` に基づいてプロジェクトをセットアップするための包括的なプロンプトです。

---

## 🚀 プロンプト: Rails + React 通話文字起こしアプリ - Docker セットアップ

以下をコピーして Claude Code（https://claude.dev）のコード生成画面に貼り付けてください。

---

### テンプレート A: Docker 環境を使用する場合（推奨）

```
以下の仕様に基づいて、Rails + React 通話音声文字起こし・要約アプリのセットアップを自動化するシェルスクリプトを作成してください。

【仕様】
- バックエンド: Rails 7.x + PostgreSQL + Sidekiq + Redis
- フロントエンド: React 18.x + esbuild + Tailwind CSS
- 外部API: OpenAI Whisper（文字起こし）+ Anthropic Claude（要約）
- 環境: Docker & Docker Compose で管理

【必須のセットアップタスク】
1. Docker Compose を使用した環境起動
2. PostgreSQL DB の初期化（マイグレーション含む）
3. Redis の起動確認
4. Sidekiq ジョブキューの起動
5. React コンポーネントの構築

【出力物】
- `setup.sh`: 自動セットアップスクリプト
  - インタラクティブに環境変数を設定（API キー等）
  - Docker コンテナの起動
  - DB マイグレーション実行
  - 開発サーバーの起動確認

- `.env.docker.example`: Docker 用環境変数テンプレート

- `docker-setup-instructions.md`: 手動セットアップ用の詳細ガイド
  - トラブルシューティング含む

【実装要件】
- macOS と Linux 双方で動作すること
- 色付きのログ出力
- エラーハンドリング（DB接続失敗時等の対応）
- セットアップ完了後に動作確認コマンドを提示
- Docker が未インストールの場合の検出と指示

出力形式: 実行可能なシェルスクリプト + Markdown ガイド
```

---

### テンプレート B: ローカル環境を使用する場合

```
以下の仕様に基づいて、ローカル環境（Docker 未使用）での Rails + React セットアップを自動化するスクリプトを作成してください。

【仕様】
- バックエンド: Rails 7.x + PostgreSQL + Sidekiq + Redis
- フロントエンド: React 18.x + esbuild + Tailwind CSS
- ローカル開発環境での直接実行

【前提条件】
- Ruby 3.2+ インストール済み
- Node.js 18+ インストール済み
- PostgreSQL 15 インストール済み
- Redis インストール済み

【必須のセットアップタスク】
1. Ruby gem のインストール（bundle install）
2. npm パッケージのインストール
3. Rails デフォルトジェネレータの実行
   - React & esbuild 統合
   - Devise ユーザー認証
   - Active Storage 設定
4. PostgreSQL DB 作成・マイグレーション
5. 環境変数ファイル生成

【出力物】
- `setup-local.sh`: ローカル環境自動セットアップスクリプト
  - インタラクティブに API キーを設定
  - 前提条件の確認（Ruby, Node.js, PostgreSQL, Redis）
  - Bundler & npm 依存関係インストール
  - DB 初期化
  - Rails サーバー起動可能状態までの準備

- `.env.local.example`: ローカル用環境変数テンプレート

- `local-setup-guide.md`: トラブルシューティング含む詳細ガイド

【実装要件】
- macOS と Linux 双方で動作
- 前提条件の ver チェック
- エラーハンドリング
- セットアップ完了後に 3 ターミナルで起動すべきプロセスを提示
  - Rails サーバー
  - esbuild watch
  - Sidekiq
  - Redis サーバー

出力形式: 実行可能なシェルスクリプト + Markdown ガイド
```

---

### テンプレート C: 段階別セットアップ（STEP ファイル群を使用）

```
以下の 10 ステップの構築ガイドに基づいて、段階的なセットアップを実行するインタラクティブなスクリプトを作成してください。

【段階】
1. Rails プロジェクト初期化
2. データモデル・マイグレーション設計
3. Devise 認証・ユーザー管理
4. React・JavaScript ビルドシステム設定
5. Active Storage・音声ファイル管理
6. Calls コントローラ・API エンドポイント
7. Sidekiq・非同期ジョブ設定
8. 外部 API 統合（Whisper・Claude）
9. React フロントエンド開発
10. デプロイ・最適化・テスト

【出力物】
- `setup-steps.sh`: ユーザー選択可能な段階的セットアップ
  - 「どのステップから実行するか」を選択可能
  - 各ステップの実行状況を ProgressBar で表示
  - スキップ・ロールバック機能

- `setup-progress.json`: 進捗状況の永続化ファイル
  - 実行したステップを記録
  - 中断後の再開に対応

- `SETUP_LOG.md`: 実行結果の詳細ログ

【実装要件】
- 各ステップは独立して実行可能
- 前のステップをスキップして進むことも可能
- エラー発生時に対象ステップ番号を通知
- セットアップ完了後に「次は何をするか」を提示

出力形式: インタラクティブなシェルスクリプト + ログ追跡システム
```

---

### テンプレート D: CI/CD パイプライン統合（自動デプロイがターゲット）

```
以下の仕様の Rails + React アプリを GitHub Actions で自動ビルド・デプロイするワークフロー定義ファイルを作成してください。

【デプロイターゲット】
- 開発環境: Docker Compose（localhost）
- 本番環境: Render / Railway / Heroku（いずれかを選択可能）

【必須パイプライン】
1. コード品質チェック
   - RuboCop（Ruby コード品質）
   - ESLint（JavaScript コード品質）
   -型チェック（TypeScript 使用時）

2. テスト実行
   - RSpec（Rails モデル・コントローラ テスト）
   - Jest（React コンポーネント テスト）

3. ビルド・デプロイ
   - Docker イメージ構築
   - ECR/Docker Hub へのプッシュ（本番時）
   - DB マイグレーション自動実行
   - Sidekiq ジョブキューの確認

【出力物】
- `.github/workflows/ci.yml`: CI パイプライン定義
- `.github/workflows/deploy.yml`: デプロイ定義
- `github-secrets-setup.md`: GitHub Secrets 設定ガイド
- `.env.ci.example`: CI 環境用の .env テンプレート

出力形式: GitHub Actions YAML ファイル + セットアップガイド
```

---

## 📋 使用方法

### Step 1: テンプレート選択
上記 A ～ D のいずれかを選択して、テンプレートのテキストをコピーしてください。

- **Docker を使いたい** → テンプレート A
- **ローカル環境のみ** → テンプレート B
- **段階的に進めたい** → テンプレート C
- **CI/CD も設定したい** → テンプレート D

### Step 2: Claude Code へ入力
1. https://claude.dev を開く
2. 左上の「+」ボタンで新規作成
3. テンプレートテキストを貼り付け
4. 「Generate」または「run」をクリック

### Step 3: 生成されたコードをダウンロード
- `.sh` ファイルをダウンロード
- `.md` ドキュメントで内容確認
- ローカルマシンで実行

---

## 🎯 各テンプレートの推奨シーン

| テンプレート | 推奨場面 | 実行時間 |
|---|---|---|
| A（Docker） | 開発開始時の高速セットアップ | 5 ～ 10 分 |
| B（ローカル） | IDE 統合が必要 / Docker 環境が整っていない | 10 ～ 15 分 |
| C（段階別） | 段階的なプロトタイプ開発 / 学習 | フレキシブル |
| D（CI/CD） | 本番デプロイを視野に入れたプロジェクト | セットアップ後 |

---

## 🔧 カスタマイズ例

### 例 1: Docker + GitHub Actions 統合

```
テンプレート A（Docker セットアップ）+ テンプレート D（CI/CD）を組み合わせて、
「ローカルで Docker で開発 → Git push で自動テスト・デプロイ」のワークフロー構築
```

### 例 2: 段階別 + CI/CD

```
テンプレート C（各ステップ の検証） + テンプレート D（本番パイプライン）を併用
```

---

## ❓ よくある質問

**Q: どのテンプレートを選べばいい？**  
A: 迷ったら **テンプレート A（Docker）** がおすすめです。最もシンプルで一貫性があります。

**Q: 複数のテンプレートを組み合わせられる？**  
A: はい。例えば「テンプレート A（Docker）」でセットアップ後に「テンプレート D（CI/CD）」を追加できます。

**Q: 既存プロジェクトに適用できる？**  
A: テンプレート C（段階別）なら、特定のステップのみ実行可能です。

**Q: 環境変数の秘匿が心配**  
A: すべてのテンプレートで `.env.example` に秘匿化していません。実際には `.env` に API キーを設定し、`.gitignore` に追加してください。

---

## 📞 トラブルシューティング

各テンプレートで生成されたスクリプト実行時にエラーが発生した場合は、

1. エラーメッセージを確認
2. 対応する `*-instructions.md` または `*-guide.md` を参照
3. それでも解決しない場合は、生成された `.log` ファイルを Claude に再入力

---

**最終更新**: 2026年4月29日  
**対応 Claude Version**: Claude 3.5 Sonnet 以上
