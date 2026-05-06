import React from 'react';

export default function Dashboard({ calls = [] }) {
  // 統計データの計算
  const totalFiles = calls.length;
  const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
  const totalHours = (totalDuration / 3600).toFixed(1);
  const summarizedCount = calls.filter(call => call.summary).length;

  const recentCalls = calls.slice(0, 5);

  const quickActions = [
    { icon: 'upload_file', label: '音声アップロード', color: 'from-primary to-primary-container' },
    { icon: 'auto_fix', label: 'AI一括要約', color: 'from-secondary to-secondary-container' },
    { icon: 'share', label: '共有設定', color: 'from-primary to-secondary' },
    { icon: 'folder_zip', label: '出力', color: 'from-tertiary to-tertiary-container' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'bg-green-50 text-green-700';
      case 'transcribing':
      case 'summarizing':
        return 'bg-blue-50 text-blue-700';
      case 'pending':
        return 'bg-gray-50 text-gray-700';
      case 'error':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      done: '完了',
      transcribing: '文字起こし中',
      summarizing: '要約中',
      pending: '待機中',
      error: 'エラー',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-on-surface">ダッシュボード</h1>
        <p className="text-on-surface-variant mt-2">通話の統計と最近のアップロード</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Files */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-on-surface-variant text-sm">ファイル総数</p>
              <p className="text-4xl font-bold text-on-surface mt-2">{totalFiles}</p>
            </div>
            <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                description
              </span>
            </div>
          </div>
        </div>

        {/* Total Hours */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-on-surface-variant text-sm">書き起こし時間</p>
              <p className="text-4xl font-bold text-on-surface mt-2">{totalHours}</p>
              <p className="text-on-surface-variant text-xs mt-1">時間</p>
            </div>
            <div className="w-12 h-12 bg-secondary-fixed rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                schedule
              </span>
            </div>
          </div>
        </div>

        {/* Summarized Count */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-on-surface-variant text-sm">AI要約</p>
              <p className="text-4xl font-bold text-on-surface mt-2">{summarizedCount}</p>
              <p className="text-on-surface-variant text-xs mt-1">件</p>
            </div>
            <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-on-surface mb-4">クイックアクション</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className={`bg-gradient-to-br ${action.color} text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all`}
            >
              <span className="material-symbols-outlined text-3xl">{action.icon}</span>
              <span className="text-sm font-medium text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Uploads */}
      <div>
        <h2 className="text-xl font-bold text-on-surface mb-4">最近のアップロード</h2>
        {recentCalls.length === 0 ? (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 text-center">
            <p className="text-on-surface-variant">アップロードされた通話はまだありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCalls.map((call) => (
              <div
                key={call.id}
                className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 flex items-center justify-between hover:bg-surface-container transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-on-surface">{call.title}</p>
                  <p className="text-sm text-on-surface-variant">
                    {new Date(call.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                  {getStatusLabel(call.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Tips Card */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <span className="material-symbols-outlined text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <div>
            <p className="font-bold text-on-surface mb-2">AI分析のヒント</p>
            <p className="text-sm text-on-surface-variant">
              音質が良いほど、AI の転記精度が向上します。静かな環境で録音することをお勧めします。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
