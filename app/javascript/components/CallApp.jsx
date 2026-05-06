import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import CallList from './CallList';
import CallUploader from './CallUploader';
import CallDetail from './CallDetail';

export default function CallApp() {
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    fetchCalls();
    const pollInterval = setInterval(fetchCalls, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await fetch('/calls');
      if (response.ok) {
        const data = await response.json();
        setCalls(data);
        setLoading(false);
      } else if (response.status === 401) {
        window.location.href = '/users/sign_in';
      }
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    }
  };

  const handleUploadComplete = () => {
    fetchCalls();
    setCurrentPage('calls');
  };

  const handleSelectCall = (call) => {
    setSelectedCall(call);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard calls={calls} />;
      case 'calls':
        return loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-on-surface-variant">読み込み中...</div>
          </div>
        ) : (
          <CallList calls={calls} onSelectCall={handleSelectCall} />
        );
      case 'upload':
        return <CallUploader onUploadComplete={handleUploadComplete} />;
      case 'analytics':
        return (
          <div className="flex items-center justify-center py-16">
            <div className="text-on-surface-variant">分析レポート（準備中）</div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center justify-center py-16">
            <div className="text-on-surface-variant">設定（準備中）</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content */}
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Top App Bar */}
        <header className="sticky top-0 h-16 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between px-8 z-30">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
            </button>
            <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">history</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Call Detail Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <button
              onClick={() => setSelectedCall(null)}
              className="absolute top-6 right-6 p-2 hover:bg-surface-container-high rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface">close</span>
            </button>
            <CallDetail call={selectedCall} onClose={() => setSelectedCall(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
