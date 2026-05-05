import React from 'react';
import AudioPlayer from './AudioPlayer';

export default function CallDetail({ call, onClose }) {
  const getStatusLabel = (status) => {
    const labels = {
      done: '完了',
      transcribing: '文字起こし中',
      summarizing: '要約中',
      pending: '待機中',
      error: 'エラー'
    };
    return labels[status] || status;
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'done':
        return 'badge-success';
      case 'transcribing':
      case 'summarizing':
        return 'badge-warning';
      case 'pending':
        return 'badge-info';
      case 'error':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  const isProcessing = call.status === 'transcribing' || call.status === 'summarizing' || call.status === 'pending';

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900">{call.title}</h2>
          <time className="text-sm text-gray-500 mt-2 block">
            {call.created_at}
          </time>
        </div>
        <button
          onClick={onClose}
          className="text-2xl text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className={`badge badge-lg ${getStatusBadgeColor(call.status)}`}>
          {getStatusLabel(call.status)}
        </span>
        {isProcessing && (
          <span className="text-sm text-gray-600">処理中...</span>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">音声</h3>
        <div data-testid="audio-player">
          <AudioPlayer audioUrl={`/calls/${call.id}/audio`} />
        </div>
      </div>

      {call.transcription && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">文字起こし</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {call.transcription}
            </p>
          </div>
        </div>
      )}

      {call.summary && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">要約</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {call.summary}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
