import React, { useState } from 'react';

function InputField({ id, label, type = 'text', name, autoComplete, required = true }) {
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
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500
                   focus:border-transparent transition-shadow placeholder-gray-400"
      />
    </div>
  );
}

function SubmitButton({ label, loading = false }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full py-3 px-4 rounded-lg font-semibold text-sm
        transition-all duration-200 ${
          loading
            ? 'bg-indigo-300 text-white cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md active:scale-[0.99]'
        }`}
    >
      {loading ? '処理中...' : label}
    </button>
  );
}

export function LoginForm({ onSwitchToSignup }) {
  const [loading, setLoading] = useState(false);
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

  return (
    <form
      action="/users/sign_in"
      method="post"
      onSubmit={() => setLoading(true)}
    >
      <input type="hidden" name="authenticity_token" value={csrfToken} />

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
            className="w-4 h-4 rounded border-gray-300 text-indigo-600
                       focus:ring-indigo-500"
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
  );
}

export function SignupForm({ onSwitchToLogin }) {
  const [loading, setLoading] = useState(false);
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ?? '';

  return (
    <form
      action="/users"
      method="post"
      onSubmit={() => setLoading(true)}
    >
      <input type="hidden" name="authenticity_token" value={csrfToken} />

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
  );
}
