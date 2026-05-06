import React, { useState, useEffect } from 'react';
import CallList from './CallList';
import CallUploader from './CallUploader';
import CallDetail from './CallDetail';

export default function CallApp() {
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [loading, setLoading] = useState(true);

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
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">通話管理</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6" data-testid="call-list">
              <h2 className="text-2xl font-semibold mb-4">通話リスト</h2>
              {loading ? (
                <div className="text-center py-8">読み込み中...</div>
              ) : (
                <CallList calls={calls} onSelectCall={setSelectedCall} />
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md p-6" data-testid="call-uploader">
              <h2 className="text-2xl font-semibold mb-4">新規アップロード</h2>
              <CallUploader onUploadComplete={handleUploadComplete} />
            </div>
          </div>
        </div>

        {selectedCall && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <CallDetail call={selectedCall} onClose={() => setSelectedCall(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
