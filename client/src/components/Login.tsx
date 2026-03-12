import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { login, isLoading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShowingRegister, setIsShowingRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password required');
      return;
    }

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  if (isShowingRegister) {
    return <Register onSuccess={onLoginSuccess} onBackToLogin={() => setIsShowingRegister(false)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-zinc-50 tracking-tight">ARC</h1>
          <p className="text-zinc-500 text-sm mt-2 tracking-widest">FOCUS QUANTIFIED</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-zinc-50 text-xs mb-3 tracking-widest">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@example.com"
              className="w-full px-4 py-3 bg-transparent border border-zinc-600 text-zinc-50 placeholder-zinc-600 outline-none focus:border-red-600 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-zinc-50 text-xs mb-3 tracking-widest">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-transparent border border-zinc-600 text-zinc-50 placeholder-zinc-600 outline-none focus:border-red-600 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="px-4 py-3 border border-red-600 bg-red-950 text-red-200 text-sm">
              {error || authError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-red-600 text-zinc-50 font-semibold tracking-widest text-sm hover:bg-red-700 transition-colors disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center border-t border-zinc-800 pt-8">
          <p className="text-zinc-500 text-xs">
            NO ACCOUNT?{' '}
            <button
              onClick={() => setIsShowingRegister(true)}
              className="text-red-600 hover:text-red-500 font-semibold tracking-wide"
            >
              CREATE ONE
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

interface RegisterProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess, onBackToLogin }) => {
  const { register, isLoading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('All fields required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-zinc-50 tracking-tight">ARC</h1>
          <p className="text-zinc-500 text-sm mt-2 tracking-widest">CREATE ACCOUNT</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-zinc-50 text-xs mb-3 tracking-widest">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@example.com"
              className="w-full px-4 py-3 bg-transparent border border-zinc-600 text-zinc-50 placeholder-zinc-600 outline-none focus:border-red-600 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-zinc-50 text-xs mb-3 tracking-widest">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 bg-transparent border border-zinc-600 text-zinc-50 placeholder-zinc-600 outline-none focus:border-red-600 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-zinc-50 text-xs mb-3 tracking-widest">
              CONFIRM PASSWORD
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-transparent border border-zinc-600 text-zinc-50 placeholder-zinc-600 outline-none focus:border-red-600 transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="px-4 py-3 border border-red-600 bg-red-950 text-red-200 text-sm">
              {error || authError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-red-600 text-zinc-50 font-semibold tracking-widest text-sm hover:bg-red-700 transition-colors disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-8 text-center border-t border-zinc-800 pt-8">
          <p className="text-zinc-500 text-xs">
            HAVE AN ACCOUNT?{' '}
            <button
              onClick={onBackToLogin}
              className="text-red-600 hover:text-red-500 font-semibold tracking-wide"
            >
              LOGIN
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
