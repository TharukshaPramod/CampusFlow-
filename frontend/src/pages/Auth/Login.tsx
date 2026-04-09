import { useEffect, useState } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import api from '../../services/api/client';

type Mode = 'login' | 'register';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>('login');
  const [oauthLoading, setOauthLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  if (user) return <Navigate to="/" replace />;

  useEffect(() => {
    const errorCode = searchParams.get('error');
    if (!errorCode) {
      return;
    }

    let message = 'Google sign-in failed. Please try again.';
    if (errorCode === 'google_user_only') {
      message = 'Only user accounts can use Google sign-in. Admin and technician accounts must use email/password login.';
    } else if (errorCode === 'account_inactive') {
      message = 'Your account is inactive. Please contact support.';
    } else if (errorCode === 'google_email_not_available') {
      message = 'Google account email was not available. Please try a different account.';
    } else if (errorCode === 'oauth2_failed') {
      message = 'Google sign-in failed during authorization. Please verify your Google redirect URI and try again.';
    }

    toast.error(message);
    const next = new URLSearchParams(searchParams);
    next.delete('error');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleGoogleLogin = () => {
    setOauthLoading(true);
    localStorage.removeItem('authToken');

    const configuredApiBase = import.meta.env.VITE_API_BASE_URL;
    const fallbackApiBase = 'http://localhost:8080/api';
    const apiBase = configuredApiBase && configuredApiBase.trim().length > 0
      ? configuredApiBase
      : fallbackApiBase;
    const apiOrigin = apiBase.replace(/\/api\/?$/, '');

    window.location.href = `${apiOrigin}/oauth2/authorization/google`;
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register') {
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (!form.name.trim()) {
        toast.error('Full name is required');
        return;
      }
    }

    setFormLoading(true);
    try {
      if (mode === 'register') {
        await api.post('/auth/register', {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });
        toast.success('Account created! Please sign in.');
        switchMode('login');
      } else {
        const res = await api.post('/auth/login', {
          email: form.email.trim(),
          password: form.password,
        });
        login(res.data.token);
        toast.success('Welcome back!');
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, background: 'rgba(59,130,246,0.12)', borderRadius: '50%', filter: 'blur(80px)', top: -100, left: -100 }} />
        <div style={{ position: 'absolute', width: 300, height: 300, background: 'rgba(99,102,241,0.1)', borderRadius: '50%', filter: 'blur(80px)', bottom: -80, right: -60 }} />
        <div style={{ position: 'absolute', width: 200, height: 200, background: 'rgba(16,185,129,0.08)', borderRadius: '50%', filter: 'blur(60px)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      </div>

      <div className="login-card" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ fontSize: 24 }}>🎓</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>CampusFlow</div>
        </div>

        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24 }}>
          {mode === 'login'
            ? 'Sign in to your account'
            : 'Join CampusFlow and get started'}
        </div>

        {/* Tab toggle */}
        <div style={{
          display: 'flex', background: 'var(--bg3)', borderRadius: 8,
          padding: 4, marginBottom: 24, gap: 4,
        }}>
          <button
            onClick={() => switchMode('login')}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none',
              background: mode === 'login' ? 'var(--bg1)' : 'transparent',
              color: 'var(--text)', cursor: 'pointer', fontWeight: 500, fontSize: 13
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode('register')}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none',
              background: mode === 'register' ? 'var(--bg1)' : 'transparent',
              color: 'var(--text)', cursor: 'pointer', fontWeight: 500, fontSize: 13
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Full name"
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            className="form-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="form-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {mode === 'register' && (
            <input
              type="password"
              placeholder="Confirm password"
              className="form-input"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={formLoading}
            style={{ width: '100%' }}
          >
            {formLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* OAuth separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--bg3)' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--bg3)' }} />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={oauthLoading}
          style={{
            width: '100%', padding: '10px 16px', borderRadius: 8,
            border: '1px solid var(--bg3)', background: 'var(--bg2)',
            color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          🔵 Continue with Google
        </button>

        {/* Footer links */}
        {mode === 'login' && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <a href="/forgot-password" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
              Forgot password?
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
