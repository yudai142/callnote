import React from 'react';

export default function CallList({ calls, onSelectCall }) {
  if (calls.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        通話がありません
      </div>
    );
  }

  const sortedCalls = [...calls].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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

  return (
    <ul className="space-y-4">
      {sortedCalls.map((call) => (
        <li
          key={call.id}
          onClick={() => onSelectCall(call)}
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{call.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {call.created_at}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{getStatusLabel(call.status)}</p>
              <p className="text-xs text-gray-500 mt-1">{call.status}</p>
            </div>
          </div>
          {call.summary && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {call.summary}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
