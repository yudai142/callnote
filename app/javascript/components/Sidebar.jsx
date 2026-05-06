import React from 'react';

export default function Sidebar({ currentPage, onNavigate }) {
  const navItems = [
    { key: 'dashboard', label: 'ダッシュボード', icon: 'dashboard' },
    { key: 'calls', label: '通話一覧', icon: 'list_alt' },
    { key: 'upload', label: '新規アップロード', icon: 'cloud_upload' },
    { key: 'analytics', label: '分析レポート', icon: 'analytics' },
    { key: 'settings', label: '設定', icon: 'settings' },
  ];

  const isActive = (page) => currentPage === page;

  const handleLogout = async (e) => {
    e.preventDefault();
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    try {
      const response = await fetch('/users/sign_out', {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        window.location.href = '/users/sign_in';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low z-40 flex flex-col border-r border-outline-variant/30">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center px-4 py-6 border-b border-outline-variant/30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white mb-2">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            record_voice_over
          </span>
        </div>
        <h1 className="text-base font-bold text-on-surface bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          CallNote
        </h1>
        <p className="text-xs text-on-surface-variant">AI議事録アシスタント</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
        {navItems.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
              isActive(key)
                ? 'text-primary bg-primary-fixed font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-base">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-2 px-3 py-4 border-t border-outline-variant/30">
        {/* Record Button */}
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-semibold text-sm transition-all hover:shadow-lg">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            mic
          </span>
          <span>録音を開始</span>
        </button>

        {/* Help Link */}
        <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg text-sm transition-colors">
          <span className="material-symbols-outlined text-base">help</span>
          <span>ヘルプ</span>
        </button>

        {/* Logout Link */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/10 rounded-lg text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
}
