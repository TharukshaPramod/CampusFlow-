import { useEffect, useState } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 pt-28 pb-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-2xl shadow-primary/10 backdrop-blur lg:grid-cols-[1.1fr_1fr]">
          <div className="relative hidden flex-col justify-between bg-gradient-to-br from-primary via-primary-dark to-accent px-10 py-12 text-white lg:flex">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-lg">🎓</span>
                CampusFlow
              </div>
              <h2 className="mt-10 text-4xl font-extrabold leading-tight">
                Hello,
                <br />
                welcome!
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                Centralize resources, bookings, and incidents in one secure hub. Keep your campus operations moving fast.
              </p>
            </div>
            <button
              type="button"
              className="mt-10 w-fit rounded-full border border-white/40 px-6 py-2 text-sm font-semibold transition hover:bg-white/15"
            >
              View more
            </button>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_35%,transparent_70%,rgba(255,255,255,0.12))]" />
          </div>

          <div className="px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Access</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {mode === 'login' ? 'Welcome back' : 'Create account'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {mode === 'login'
                    ? 'Sign in to continue managing your campus.'
                    : 'Join CampusFlow and start collaborating today.'}
                </p>
              </div>
              <div className="hidden sm:flex rounded-full bg-slate-100 p-1">
                <button
                  onClick={() => switchMode('login')}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchMode('register')}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            <div className="mt-6 sm:hidden">
              <div className="flex rounded-full bg-slate-100 p-1">
                <button
                  onClick={() => switchMode('login')}
                  className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchMode('register')}
                  className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                className="mt-8 space-y-4"
              >
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Full name
                    </label>
                    <input
                      type="text"
                      placeholder="Alex Johnson"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </motion.div>
                )}

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>

                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      placeholder="Repeat your password"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      required
                    />
                  </motion.div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                    Remember me
                  </label>
                  {mode === 'login' && (
                    <a href="/forgot-password" className="font-semibold text-primary hover:text-primary-dark">
                      Forgot password?
                    </a>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formLoading ? 'Loading...' : mode === 'login' ? 'Login' : 'Create account'}
                </button>
              </motion.form>
            </AnimatePresence>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={oauthLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-base">🔵</span>
              Continue with Google
            </button>

            <div className="mt-6 text-center text-sm text-slate-500">
              {mode === 'login' ? 'Not a member yet?' : 'Already have an account?'}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="ml-2 font-semibold text-primary hover:text-primary-dark"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
