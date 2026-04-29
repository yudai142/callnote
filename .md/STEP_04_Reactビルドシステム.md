# STEP 4: React・JavaScript ビルドシステム設定

## 目的
esbuild + react-rails を使用して React コンポーネントを Rails ビューに埋め込める環境を構築する。

## インストール
```bash
# 1. jsbundling-rails + react-rails インストール
bundle add jsbundling-rails react-rails cssbundling-rails

# 2. esbuild 初期化
rails javascript:install:esbuild

# 3. Tailwind CSS + daisyUI セットアップ
rails css:install:tailwind

# 4. React 初期化
rails generate react:install
```

## ファイル確認・修正

**`package.json`** に以下が含まれているか確認
```json
{
  "dependencies": {
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "@rails/webpacker": "^6.0.0"
  },
  "scripts": {
    "build": "esbuild app/javascript/*.* --bundle --sourcemap --outdir=app/assets/builds",
    "build:css": "tailwindcss -i ./app/assets/stylesheets/application.tailwind.css -o ./app/assets/builds/application.css"
  }
}
```

**`Procfile.dev`** （開発用サーバー管理）
```
web: rails s -p 3000
js: npm run build -- --watch
css: npm run build:css -- --watch
```

## テスト方法
```bash
# 1. build スクリプト実行
npm run build

# 2. Rails サーバー起動
rails s -p 3000

# 3. ブラウザの Developer Tools → Network タブ確認
#    JavaScript が /assets/builds/..js で読み込まれるか確認
```

## 次のステップ
→ [STEP 5: Active Storage・音声ファイル管理](STEP_05_ActiveStorage.md)
