'use client';

import { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      onLoginSuccess();
    } else {
      setError(data.message || 'Login failed');
    }
  } catch (err) {
    setError('Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-500 to-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full
                   ring-1 ring-black/10
                   flex flex-col"
        aria-labelledby="login-title"
        noValidate
      >
        <h2
          id="login-title"
          className="text-4xl font-extrabold mb-8 text-center text-black tracking-wide"
        >
          Welcome Back
        </h2>

        {error && (
          <div
            role="alert"
            className="flex items-center mb-6 bg-black/5 text-black text-sm rounded-md px-4 py-3 animate-pulse"
          >
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 stroke-black"
              fill="none"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>{error}</p>
          </div>
        )}

        <label
          htmlFor="username"
          className="block text-black font-semibold mb-1"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          placeholder="Your username"
          className="mb-6 w-full px-4 py-3 border border-black/20 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-black
                     placeholder-black/40 text-black transition duration-200"
        />

        <label
          htmlFor="password"
          className="block text-black font-semibold mb-1"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="Your password"
          className="mb-8 w-full px-4 py-3 border border-black/20 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-black
                     placeholder-black/40 text-black transition duration-200"
        />

        <button
          type="submit"
          disabled={loading}
          className="relative w-full py-3 bg-black text-white rounded-xl
                     font-semibold tracking-wide hover:bg-gray-900 focus-visible:outline
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black
                     disabled:bg-black/50 disabled:cursor-not-allowed
                     flex justify-center items-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
}
