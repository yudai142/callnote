# STEP 9: React フロントエンド開発

## 目的
React コンポーネントを使用してUI/UXを実装し、ユーザーが通話をアップロード・確認・再生できる画面を構築する。

## ディレクトリ構成
```
app/javascript/components/
├── CallApp.jsx              # ルートコンポーネント
├── CallList.jsx             # 通話リスト表示
├── CallUploader.jsx         # ファイルアップロード
├── CallDetail.jsx           # 通話詳細・文字起こし表示
└── AudioPlayer.jsx          # 音声プレイヤー
```

## ファイル作成

**`app/javascript/components/CallApp.jsx`**
```jsx
import React, { useState, useEffect } from 'react';
import CallList from './CallList';
import CallUploader from './CallUploader';

export default function CallApp() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const response = await fetch('/calls', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]')?.content
        }
      });
      const data = await response.json();
      setCalls(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
    // ポーリング: 5秒ごとに更新
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadSuccess = (newCall) => {
    setCalls([newCall, ...calls]);
  };

  const handleDeleteCall = (callId) => {
    setCalls(calls.filter(c => c.id !== callId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">通話音声文字起こしアプリ</h1>
        
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CallUploader onUploadSuccess={handleUploadSuccess} />
          </div>
          
          <div className="lg:col-span-2">
            <CallList
              calls={calls}
              loading={loading}
              onDeleteCall={handleDeleteCall}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**`app/javascript/components/CallUploader.jsx`**
```jsx
import React, { useState } from 'react';

export default function CallUploader({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      
      // 音声ファイルの長さ取得
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        setDuration(Math.round(audio.duration));
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fileInput = e.target.querySelector('input[type="file"]');
    const formData = new FormData();
    formData.append('call[title]', title || fileName.split('.')[0]);
    formData.append('call[audio]', fileInput.files[0]);
    formData.append('call[duration]', duration);

    try {
      const response = await fetch('/calls', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]')?.content
        }
      });

      if (response.ok) {
        const newCall = await response.json();
        onUploadSuccess(newCall);
        setFileName('');
        setTitle('');
        setDuration(0);
        fileInput.value = '';
      } else {
        alert('アップロード失敗');
      }
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4">新しい通話をアップロード</h2>
      
      <input
        type="text"
        placeholder="通話タイトル（オプション）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full mb-4"
      />

      <label className="form-control w-full mb-4">
        <div className="label">
          <span className="label-text">音声ファイル (m4a, mp3, wav)</span>
        </div>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="file-input file-input-bordered w-full"
          required
        />
      </label>

      {fileName && <p className="text-sm text-gray-600 mb-2">ファイル: {fileName}</p>}
      {duration > 0 && <p className="text-sm text-gray-600 mb-4">長さ: {duration}秒</p>}

      <button
        type="submit"
        disabled={loading || !fileName}
        className="btn btn-primary w-full"
      >
        {loading ? '処理中...' : 'アップロード'}
      </button>
    </form>
  );
}
```

**`app/javascript/components/CallList.jsx`**
```jsx
import React from 'react';
import CallDetail from './CallDetail';

export default function CallList({ calls, loading, onDeleteCall }) {
  if (loading && calls.length === 0) {
    return <div className="loading loading-spinner"></div>;
  }

  if (calls.length === 0) {
    return <p className="text-gray-500">通話がありません</p>;
  }

  return (
    <div className="space-y-4">
      {calls.map((call) => (
        <CallDetail
          key={call.id}
          call={call}
          onDelete={onDeleteCall}
        />
      ))}
    </div>
  );
}
```

**`app/javascript/components/CallDetail.jsx`**
```jsx
import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';

export default function CallDetail({ call, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return;

    try {
      const response = await fetch(`/calls/${call.id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]')?.content
        }
      });

      if (response.ok) {
        onDelete(call.id);
      }
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'badge badge-warning',
      transcribing: 'badge badge-info',
      summarizing: 'badge badge-info',
      done: 'badge badge-success',
      error: 'badge badge-error'
    };
    return statusMap[status] || 'badge';
  };

  const getStatusText = (status) => {
    const textMap = {
      pending: '待機中',
      transcribing: '文字起こし中',
      summarizing: '要約中',
      done: '完了',
      error: 'エラー'
    };
    return textMap[status] || status;
  };

  return (
    <div className="card bg-base-100 shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{call.title}</h3>
          <p className="text-sm text-gray-500">{new Date(call.created_at).toLocaleString('ja-JP')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={getStatusBadge(call.status)}>
            {getStatusText(call.status)}
          </span>
          <button
            onClick={handleDelete}
            className="btn btn-sm btn-ghost"
          >
            ✕
          </button>
        </div>
      </div>

      {call.audio_url && (
        <div className="mb-4">
          <AudioPlayer url={call.audio_url} filename={call.audio_filename} />
        </div>
      )}

      {call.transcription && (
        <div className="mb-4">
          <h4 className="font-bold text-lg mb-2">文字起こし</h4>
          <p className="text-sm bg-gray-50 p-4 rounded">{call.transcription}</p>
        </div>
      )}

      {call.summary && (
        <div>
          <h4 className="font-bold text-lg mb-2">要約</h4>
          <p className="text-sm bg-blue-50 p-4 rounded">{call.summary}</p>
        </div>
      )}

      {call.status === 'error' && (
        <div className="alert alert-error">
          <span>処理中にエラーが発生しました</span>
        </div>
      )}
    </div>
  );
}
```

**`app/javascript/components/AudioPlayer.jsx`**
```jsx
import React, { useRef } from 'react';

export default function AudioPlayer({ url, filename }) {
  const audioRef = useRef(null);

  return (
    <div className="bg-gray-100 p-4 rounded">
      <p className="text-sm font-semibold mb-2">音声: {filename}</p>
      <audio
        ref={audioRef}
        controls
        className="w-full"
        style={{ height: '40px' }}
      >
        <source src={url} type="audio/mp4" />
        ブラウザが音声再生に対応していません
      </audio>
    </div>
  );
}
```

## ビューファイル修正

**`app/views/calls/index.html.erb`** （作成）
```erb
<%= react_component("CallApp", {
  csrf_token: form_authenticity_token
}) %>
```

## テスト方法
```bash
# 1. npm build
npm run build

# 2. Rails サーバー起動
rails s -p 3000

# 3. ブラウザで http://localhost:3000 にアクセス
# 4. ログイン → アップロードフォーム表示
```

## 次のステップ
→ [STEP 10: デプロイ・最適化・テスト](STEP_10_デプロイ.md)
