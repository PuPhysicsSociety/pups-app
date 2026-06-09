'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/admin');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      await refreshUser();
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/logo.png" alt="PUPS" className="login-logo" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        <div className="login-title">Admin Access</div>
        <div className="login-sub">Presidency University Physics Society</div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="lf">
            <label htmlFor="l-user">Username</label>
            <input
              id="l-user"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@pups.edu"
              autoComplete="username"
              required
            />
          </div>
          <div className="lf">
            <label htmlFor="l-pass">Password</label>
            <input
              id="l-pass"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <div className="login-err">{error}</div>}

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>
      </div>
    </div>
  );
}
