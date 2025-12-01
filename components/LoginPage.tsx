import React, { useState } from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { registerUser, loginUser, verifyCode, resendCode } from '../services/api';

interface LoginPageProps {
  onLogin: () => void;
}

type AuthMode = 'login' | 'signup' | 'verify';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const result = await registerUser(email, name, password);

        // Check if instant signup (user object present)
        if (result.user) {
          localStorage.setItem('userEmail', result.user.email);
          localStorage.setItem('userName', result.user.name || '');
          localStorage.setItem('userId', result.user.id);
          onLogin();
        } else {
          // Fallback for verification flow
          setSuccessMessage('Verification code sent to your email!');
          setMode('verify');
        }
      } else {
        const result = await loginUser(email, password);
        localStorage.setItem('userEmail', result.user.email);
        localStorage.setItem('userName', result.user.name || '');
        localStorage.setItem('userId', result.user.id);
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only numbers

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeString = code.join('');
    if (codeString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await verifyCode(email, codeString, name);
      localStorage.setItem('userEmail', result.user.email);
      localStorage.setItem('userName', result.user.name || '');
      localStorage.setItem('userId', result.user.id);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    try {
      await resendCode(email);
      setSuccessMessage('New code sent!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Animated gradient blobs -- background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-purple/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-fresh-green/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-gold/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="w-full max-w-md text-center relative z-10">
        {/* Logo */}
        <div className="animate-fade-in-stagger animate-float" style={{ animationDelay: '100ms' }}>
          <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-transparent border border-brand-purple/30 mb-6">
            <ShieldCheckIcon className="w-12 h-12 text-brand-purple" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 animate-fade-in-stagger" style={{ animationDelay: '200ms' }}>
          <span className="bg-gradient-to-r from-off-white via-brand-purple to-off-white bg-clip-text text-transparent animate-gradient-x">
            Track with confidence.
          </span>
        </h1>

        <p className="text-lg text-muted-silver mb-10 leading-relaxed animate-fade-in-stagger" style={{ animationDelay: '300ms' }}>
          {mode === 'verify' ? 'Check your email for the verification code' : 'Sign in to manage your warranties and receipts.'}
        </p>

        {/* Tabs - Only show when not verifying */}
        {mode !== 'verify' && (
          <div className="flex gap-2 mb-6 animate-fade-in-stagger" style={{ animationDelay: '350ms' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${mode === 'login'
                ? 'bg-brand-purple text-white'
                : 'bg-charcoal-gray text-muted-silver hover:bg-charcoal-gray/80'
                }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${mode === 'signup'
                ? 'bg-brand-purple text-white'
                : 'bg-charcoal-gray text-muted-silver hover:bg-charcoal-gray/80'
                }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            {successMessage}
          </div>
        )}

        {/* Form */}
        {mode !== 'verify' ? (
          <form onSubmit={handleAuthSubmit} className="space-y-6 animate-fade-in-stagger" style={{ animationDelay: '400ms' }}>
            {mode === 'signup' && (
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-5 py-4 border-2 border-transparent text-off-white placeholder-muted-silver focus:outline-none focus:border-brand-purple transition-all duration-300 sm:text-base clay-inset group-hover:border-white/10"
                  required
                />
              </div>
            )}

            <div className="relative group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-5 py-4 border-2 border-transparent text-off-white placeholder-muted-silver focus:outline-none focus:border-brand-purple transition-all duration-300 sm:text-base clay-inset group-hover:border-white/10"
                required
              />
            </div>

            <div className="relative group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-5 py-4 border-2 border-transparent text-off-white placeholder-muted-silver focus:outline-none focus:border-brand-purple transition-all duration-300 sm:text-base clay-inset group-hover:border-white/10"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-8 bg-gradient-to-r from-brand-purple to-brand-purple/80 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-brand-purple/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Create Account →' : 'Login →'}
            </button>
          </form>
        ) : (
          // Verification Code Form
          <form onSubmit={handleVerifySubmit} className="space-y-6 animate-fade-in-stagger" style={{ animationDelay: '400ms' }}>
            <div>
              <p className="text-sm text-muted-silver mb-4">
                Enter the 6-digit code sent to <strong className="text-white">{email}</strong>
              </p>

              {/* 6-digit input */}
              <div className="flex gap-2 justify-center mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-charcoal-gray text-white rounded-lg border-2 border-transparent focus:border-brand-purple focus:outline-none transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-8 bg-gradient-to-r from-brand-purple to-brand-purple/80 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-brand-purple/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode('signup'); // Go back to signup since verification is only for signup
                  setCode(['', '', '', '', '', '']);
                  setError('');
                }}
                className="text-muted-silver hover:text-white transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-brand-purple hover:text-brand-purple/80 transition disabled:opacity-50"
              >
                Resend Code
              </button>
            </div>

            <p className="text-xs text-muted-silver">
              Code expires in 10 minutes
            </p>
          </form>
        )}

        {/* Feature highlights */}
        {mode !== 'verify' && (
          <div className="mt-12 grid grid-cols-3 gap-4 animate-fade-in-stagger" style={{ animationDelay: '500ms' }}>
            <div className="text-center">
              <div className="text-2xl mb-2">📸</div>
              <p className="text-xs text-muted-silver">Scan Receipts</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔔</div>
              <p className="text-xs text-muted-silver">Get Alerts</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-xs text-muted-silver">Track All</p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-silver mt-8">
          {mode === 'signup' ? 'Already have an account?' : 'New to Warranto?'}{' '}
          {mode !== 'verify' && (
            <button
              type="button"
              onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}
              className="text-brand-purple hover:underline"
            >
              {mode === 'signup' ? 'Login' : 'Sign Up'}
            </button>
          )}
        </p>
      </div>
    </div>
  );
};