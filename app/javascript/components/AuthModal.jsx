import React, { useState, useEffect, useRef } from 'react';
import { LoginForm, SignupForm } from './AuthForms';

export default function AuthModal({ initialTab = 'login', onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={activeTab === 'login' ? 'ログイン' : 'サインアップ'}>
      <div ref={modalRef} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-modal-enter">
        <div className="relative px-6 pt-6 pb-0">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors" aria-label="閉じる">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl mb-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">CallNote</h2>
          </div>

          <div className="flex border-b border-gray-200">
            {[
              { key: 'login', label: 'ログイン' },
              { key: 'signup', label: 'サインアップ' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === key ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-6">
          {activeTab === 'login' ? (
            <LoginForm onSwitchToSignup={() => setActiveTab('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setActiveTab('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
