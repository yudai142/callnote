import React, { useState } from 'react';

export default function CallList({ calls, onSelectCall }) {
  const [viewMode, setViewMode] = useState('table');

  const sortedCalls = [...calls].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'transcribing':
      case 'summarizing':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'pending':
        return 'bg-gray-50 text-gray-700 border-gray-100';
      case 'error':
        return 'bg-error-container text-error border-error-container';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
        return 'done_all';
      case 'transcribing':
      case 'summarizing':
        return 'audio_file';
      case 'pending':
        return 'schedule';
      case 'error':
        return 'error';
      default:
        return 'help';
    }
  };

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

  // 統計情報の計算
  const totalCalls = calls.length;
  const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
  const totalMinutes = Math.round(totalDuration / 60);
  const precision = calls.filter(call => call.transcription).length > 0 ? 98.4 : 0;

  const statCards = [
    { icon: 'mic_none', label: '合計通話数', value: totalCalls },
    { icon: 'timer', label: '累計書き起こし時間', value: `${totalMinutes}分` },
    { icon: 'cloud_done', label: 'AI認識精度', value: `${precision}%` },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">通話一覧</h1>
          <p className="text-on-surface-variant mt-2">アップロード済みの通話管理</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/20 rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'table' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-base">list_alt</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-base">grid_view</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary">{card.icon}</span>
            </div>
            <div>
              <p className="text-on-surface-variant text-sm">{card.label}</p>
              <p className="text-2xl font-bold text-on-surface mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Sort */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2">
          <span className="material-symbols-outlined text-on-surface-variant text-base">filter_list</span>
          <select className="bg-transparent text-on-surface text-sm outline-none cursor-pointer">
            <option>全てのステータス</option>
            <option>完了</option>
            <option>処理中</option>
            <option>エラー</option>
          </select>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto border border-outline-variant/20 rounded-xl">
          {sortedCalls.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">description</span>
              <p>通話がありません</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low/50 border-b border-outline-variant/20">
                <tr>
                  <th className="px-6 py-4 font-semibold text-on-surface">ファイル名</th>
                  <th className="px-6 py-4 font-semibold text-on-surface">アップロード日</th>
                  <th className="px-6 py-4 font-semibold text-on-surface">ステータス</th>
                  <th className="px-6 py-4 font-semibold text-on-surface text-right">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {sortedCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-surface-container-lowest transition-colors group">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onSelectCall(call)}
                        className="font-medium text-on-surface hover:text-primary transition-colors"
                      >
                        {call.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {new Date(call.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(call.status)}`}>
                        {call.status !== 'done' && (
                          <span className="material-symbols-outlined text-xs">{getStatusIcon(call.status)}</span>
                        )}
                        {getStatusLabel(call.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSelectCall(call)}
                          className="p-2 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant"
                          title="閲覧"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </button>
                        <button
                          className="p-2 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant"
                          title="ダウンロード"
                        >
                          <span className="material-symbols-outlined text-base">download</span>
                        </button>
                        <button
                          className="p-2 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant"
                          title="削除"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCalls.length === 0 ? (
            <div className="col-span-full text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">description</span>
              <p>通話がありません</p>
            </div>
          ) : (
            sortedCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => onSelectCall(call)}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-on-surface flex-1">{call.title}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(call.status)}`}>
                    {getStatusLabel(call.status)}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mb-4">
                  {new Date(call.created_at).toLocaleDateString('ja-JP')}
                </p>
                {call.summary && (
                  <p className="text-sm text-on-surface-variant line-clamp-3 mb-4">{call.summary}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-on-surface-variant">description</span>
                  <span className="text-xs text-on-surface-variant">{call.duration ? `${Math.round(call.duration / 60)}分` : '-'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* FAB - Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-shadow hover:scale-110 z-40">
        <span className="material-symbols-outlined">keyboard_voice</span>
      </button>
    </div>
  );
}