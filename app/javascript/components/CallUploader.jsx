import React, { useState } from 'react';

export default function CallUploader({ onUploadComplete }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setError(null);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('call[title]', title || fileName);
    if (file) {
      formData.append('call[audio]', file);
    }

    try {
      const response = await fetch('/calls', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || ''
        }
      });

      if (response.ok) {
        setTitle('');
        setFile(null);
        setFileName('');
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        const data = await response.json();
        setError(data.errors?.[0] || 'アップロードに失敗しました');
      }
    } catch (err) {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const guides = [
    { icon: 'graphite', title: '高音質で記録', desc: '静かな環境での録音が推奨されます' },
    { icon: 'auto_awesome', title: 'AI自動要約', desc: '文字起こし後に自動で要約を生成' },
    { icon: 'group', title: 'チームで共有', desc: '同僚と転記内容を簡単に共有' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-on-surface">音声ファイルをアップロード</h1>
        <p className="text-on-surface-variant mt-2">MP3、WAV、M4A などの音声ファイルを選択してください</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label htmlFor="title-input" className="block text-sm font-medium text-on-surface mb-2">
            タイトル（オプション）
          </label>
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：営業会議 2026-05-05"
            className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-xl text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center transition-all ${
            dragActive
              ? 'border-primary bg-primary-fixed'
              : `border-outline-variant bg-gradient-to-br from-surface-container-lowest to-surface-container-low hover:border-primary group`
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-24 h-24 bg-primary-fixed rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'wght' 200" }}>
              upload_file
            </span>
          </div>

          {fileName ? (
            <div>
              <p className="text-lg font-medium text-primary mb-2">{fileName}</p>
              <p className="text-sm text-on-surface-variant">別のファイルを選択するにはクリック</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-on-surface mb-2">
                ファイルをドラッグ&ドロップ
              </p>
              <p className="text-sm text-on-surface-variant mb-4">または</p>
              <button
                type="button"
                onClick={handleFileButtonClick}
                className="px-8 py-3 bg-primary text-on-primary rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow active:scale-95"
              >
                ファイルを選択
              </button>
            </div>
          )}

          <p className="text-xs text-on-surface-variant mt-6">
            対応形式: <span className="font-medium">MP3、WAV、M4A、FLAC</span> | 最大サイズ: <span className="font-medium">500MB</span>
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-error-container border border-error rounded-2xl p-4 flex items-start gap-4">
            <span className="material-symbols-outlined text-error flex-shrink-0">error</span>
            <div>
              <p className="font-medium text-error mb-1">エラーが発生しました</p>
              <p className="text-sm text-error opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
            loading
              ? 'bg-primary-fixed text-primary-fixed-dim cursor-not-allowed'
              : !file
              ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
              : 'bg-primary text-on-primary hover:shadow-lg active:scale-95'
          }`}
        >
          {loading ? '処理中...' : 'アップロードする'}
        </button>
      </form>

      {/* Guide Section */}
      <div>
        <h2 className="text-lg font-bold text-on-surface mb-6">CallNote の特徴</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guides.map((guide, idx) => (
            <div key={idx} className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-xl">{guide.icon}</span>
              </div>
              <h3 className="font-semibold text-on-surface mb-2">{guide.title}</h3>
              <p className="text-sm text-on-surface-variant">{guide.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}