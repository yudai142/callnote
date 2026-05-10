import React, { useState } from 'react';

function InputField({ id, label, type = 'text', name, autoComplete, required = true, error = null }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        autoComplete={autoComplete}
        required={required}
        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow placeholder-gray-400 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SubmitButton({ label, loading = false }) {
  return (
    <button type="submit" disabled={loading} className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${loading ? 'bg-indigo-300 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-[0.99]'}`}>
      {loading ? '処理中...' : label}
    </button>
  );
}

function ErrorPopup({ errors, isOpen, onClose }) {
  if (!isOpen || !errors || errors.length === 0) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
      >
        <h3 className="text-lg font-semibold text-red-600 mb-3">エラーが発生しました</h3>
        <ul className="space-y-2 mb-4">
          {errors.map((error, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClose();
            }
          }}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors cursor-pointer"
        >
          了解
        </button>
      </div>
    </div>
  );
}

export function LoginForm({ onSwitchToSignup }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const formData = new FormData(e.target);
    const data = {
      user: {
        email: formData.get('user[email]'),
        password: formData.get('user[password]'),
        remember_me: formData.get('user[remember_me]') ? '1' : '0'
      }
    };

    try {
      const response = await fetch('/users/sign_in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        const result = await response.json();
        // Handle both custom format { success: false, errors: [...] } and Devise default format { error: "..." }
        const errorList = result.errors || (result.error ? [result.error] : ['ログインに失敗しました']);
        setErrors(errorList);
        setShowErrorPopup(true);
      }
    } catch (error) {
      setErrors(['通信エラーが発生しました']);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setShowErrorPopup(false);
    setErrors([]);
  };

  return (
    <>
      <ErrorPopup errors={errors} isOpen={showErrorPopup} onClose={handleCloseError} />
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <InputField
            id="login-email"
            label="メールアドレス"
            type="email"
            name="user[email]"
            autoComplete="email"
          />
          <InputField
            id="login-password"
            label="パスワード"
            type="password"
            name="user[password]"
            autoComplete="current-password"
          />

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="user[remember_me]"
              value="1"
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">ログイン状態を保持する</span>
          </label>

          <SubmitButton label="ログイン" loading={loading} />
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          アカウントをお持ちでない方は{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-indigo-600 font-medium hover:underline"
          >
            サインアップ
          </button>
        </p>
      </form>
    </>
  );
}

export function SignupForm({ onSwitchToLogin }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const formData = new FormData(e.target);
    const data = {
      user: {
        email: formData.get('user[email]'),
        password: formData.get('user[password]'),
        password_confirmation: formData.get('user[password_confirmation]')
      }
    };

    try {
      const response = await fetch('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        const contentType = response.headers.get('content-type');
        let errorList = ['アカウント作成に失敗しました'];

        if (contentType && contentType.includes('application/json')) {
          try {
            const result = await response.json();
            errorList = result.errors || errorList;
          } catch (e) {
            console.error('Failed to parse JSON response:', e);
          }
        } else {
          console.warn('Non-JSON response received:', contentType);
        }

        setErrors(errorList);
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(['通信エラーが発生しました']);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setShowErrorPopup(false);
    setErrors([]);
  };

  return (
    <>
      <ErrorPopup errors={errors} isOpen={showErrorPopup} onClose={handleCloseError} />
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <InputField
            id="signup-email"
            label="メールアドレス"
            type="email"
            name="user[email]"
            autoComplete="email"
          />
          <InputField
            id="signup-password"
            label="パスワード"
            type="password"
            name="user[password]"
            autoComplete="new-password"
          />
          <InputField
            id="signup-password-confirmation"
            label="パスワード（確認）"
            type="password"
            name="user[password_confirmation]"
            autoComplete="new-password"
          />

          <SubmitButton label="アカウントを作成" loading={loading} />
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          すでにアカウントをお持ちの方は{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-indigo-600 font-medium hover:underline"
          >
            ログイン
          </button>
        </p>
      </form>
    </>
  );
}
