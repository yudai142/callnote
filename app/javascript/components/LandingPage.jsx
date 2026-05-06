import React, { useState } from 'react';
import AuthModal from './AuthModal';

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const openLogin = () => {
    setActiveTab('login');
    setModalOpen(true);
  };

  const openSignup = () => {
    setActiveTab('signup');
    setModalOpen(true);
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center px-8 py-16 bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800">
        <div className="text-white max-w-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight">CallNote</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            通話を記録し、<br />
            AIが要約する
          </h1>
          <p className="text-lg text-indigo-100 mb-10 leading-relaxed">
            音声ファイルをアップロードするだけで、
            Groq AI が自動で文字起こしと要約を行います。
            重要な内容を見逃しません。
          </p>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={openSignup}
              className="px-7 py-3 bg-white text-indigo-700 font-semibold rounded-xl shadow-lg hover:bg-indigo-50 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            >
              無料で始める
            </button>
            <button
              onClick={openLogin}
              className="px-7 py-3 border-2 border-white border-opacity-60 text-white font-semibold rounded-xl hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              ログイン
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-16 bg-gray-50">
        <div className="max-w-sm w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-8">主な機能</h2>
          <ul className="space-y-6">
            {[
              {
                icon: '🎙️',
                title: '音声ファイル管理',
                desc: 'MP3、WAV などの音声ファイルを安全にアップロード・管理できます。',
              },
              {
                icon: '✍️',
                title: '自動文字起こし',
                desc: 'Groq API を使用して、高精度な日本語の文字起こしを自動実行。',
              },
              {
                icon: '📝',
                title: 'AI 要約',
                desc: '通話内容を自動的に要約し、重要なポイントを即座に把握できます。',
              },
            ].map(({ icon, title, desc }) => (
              <li key={title} className="flex gap-4">
                <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {modalOpen && (
        <AuthModal
          initialTab={activeTab}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
