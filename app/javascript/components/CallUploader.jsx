import React, { useState } from 'react';

export default function CallUploader({ onUploadComplete }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');

  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
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
    formData.append('call[title]', title);
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

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">通話をアップロード</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title-input" className="block text-sm font-medium text-gray-700 mb-2">
          通話タイトル
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：営業会議 2026-05-05"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          音声ファイル
        </label>
        <button
          type="button"
          onClick={handleFileButtonClick}
          className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors relative"
        >
          <input
            ref={fileInputRef}
            id="audio-input"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden absolute"
            required
          />
          <div className="text-center pointer-events-none">
            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12v12m0 0l-4-4m4 4l4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              {fileName ? (
                <span className="font-medium text-blue-600">{fileName}</span>
              ) : (
                <>
                  <span className="font-medium text-blue-600">ファイルを選択</span>
                  <span className="text-gray-500"> またはドラッグ&ドロップ</span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">MP3, WAV, M4A など</p>
          </div>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2" /></svg>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? '通話をアップロード中...' : 'アップロード'}
      </button>
    </form>
    </>
  );
}
