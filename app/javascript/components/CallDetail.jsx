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

  const isProcessing = call.status === 'transcribing' || call.status === 'summarizing' || call.status === 'pending';

  // 要約を箇条書きに変換
  const summaryPoints = call.summary?.split('\n').filter(line => line.trim()) || [];

  // キーワード抽出（モック）
  const keywords = ['営業', '要件', '納期', 'API', 'UI/UX'].slice(0, 5);

  // 次のアクション（モック）
  const actions = [
    { label: '要件定義書を作成', done: false },
    { label: 'デモビデオを撮影', done: false },
    { label: '関係者にレビュー依頼', done: true },
  ];

  // 参加者（モック）
  const participants = [
    { name: '佐藤', color: 'bg-primary-fixed' },
    { name: '鈴木', color: 'bg-secondary-fixed' },
    { name: '田中', color: 'bg-tertiary-fixed' },
    { name: '山田', color: 'bg-primary-container' },
  ];

  return (
    <div className="h-full flex flex-col bg-surface-container-lowest overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 px-8 py-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest z-10">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-on-surface">{call.title}</h2>
          <time className="text-sm text-on-surface-variant mt-1">
            {new Date(call.created_at).toLocaleDateString('ja-JP')}
          </time>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
          aria-label="閉じる"
        >
          <span className="material-symbols-outlined text-on-surface">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Status */}
          <div className="flex items-center gap-4 mb-8">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              call.status === 'done'
                ? 'bg-green-50 text-green-700'
                : call.status === 'error'
                ? 'bg-error-container text-error'
                : 'bg-blue-50 text-blue-700'
            }`}>
              {getStatusLabel(call.status)}
            </span>
            {isProcessing && (
              <span className="text-sm text-on-surface-variant">処理中...</span>
            )}
          </div>

          {/* Audio Player */}
          <div className="mb-8">
            <AudioPlayer audioUrl={`/calls/${call.id}/audio`} />
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column: Transcription */}
            <div className="col-span-2 space-y-6">
              {call.transcription ? (
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-4">文字起こし</h3>
                  <div className="space-y-4">
                    {/* Mock transcription with speakers */}
                    {call.transcription.split('\n').slice(0, 5).map((line, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full ${idx % 2 === 0 ? 'bg-primary-fixed' : 'bg-secondary-fixed'} flex items-center justify-center text-xs font-bold text-on-surface`}>
                            {idx % 2 === 0 ? '佐' : '鈴'}
                          </div>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 flex-1">
                          <p className="text-sm text-on-surface">{line}</p>
                        </div>
                      </div>
                    ))}
                    {call.transcription.split('\n').length > 5 && (
                      <p className="text-sm text-on-surface-variant text-center py-4">... ほか {call.transcription.split('\n').length - 5} 件</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-on-surface-variant">
                  文字起こしが処理中またはまだ利用できません
                </div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="col-span-1 space-y-4">
              {/* Summary */}
              <div className="bg-surface-container-high/50 rounded-3xl p-6 border border-outline-variant/20">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <h4 className="font-bold text-on-surface">AI要約</h4>
                </div>
                {call.summary ? (
                  <ul className="space-y-2">
                    {summaryPoints.slice(0, 5).map((point, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-on-surface-variant">
                        <span className="text-secondary font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-on-surface-variant">要約処理中...</p>
                )}
              </div>

              {/* Keywords */}
              <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/20">
                <h4 className="font-bold text-on-surface mb-3">重要キーワード</h4>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, idx) => (
                    <span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium ${
                      idx === 0 ? 'bg-primary-fixed text-on-primary-fixed' :
                      idx === 1 ? 'bg-secondary-fixed text-on-secondary-fixed' :
                      'bg-surface-container-highest text-on-surface'
                    }`}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Next Actions */}
              <div className="bg-white rounded-3xl p-6 border border-outline-variant/20">
                <h4 className="font-bold text-on-surface mb-3">次のアクション</h4>
                <ul className="space-y-2">
                  {actions.map((action, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={action.done}
                        readOnly
                        className="w-4 h-4 rounded border-primary"
                      />
                      <label className={action.done ? 'line-through text-on-surface-variant' : 'text-on-surface'}>
                        {action.label}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Participants */}
              <div className="bg-surface-container-highest/30 rounded-3xl p-6 border border-outline-variant/20">
                <h4 className="font-bold text-on-surface mb-3">参加者</h4>
                <div className="flex -space-x-2">
                  {participants.map((p, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded-full ${p.color} flex items-center justify-center text-xs font-bold text-on-surface border-2 border-surface-container-lowest`}
                      title={p.name}
                    >
                      {p.name[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
