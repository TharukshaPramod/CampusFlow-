import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api/client';

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 8;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();

  const [loadingToken, setLoadingToken] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const verifyResetToken = async () => {
      if (!token) {
        toast.error('Reset token is missing');
        navigate('/login', { replace: true });
        return;
      }

      setLoadingToken(true);
      try {
        const res = await api.get('/auth/verify-token', { params: { token } });
        setEmail(res.data?.email || '');
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Reset token is invalid or expired');
        navigate('/login', { replace: true });
      } finally {
        setLoadingToken(false);
      }
    };

    verifyResetToken();
  }, [token, navigate]);

  const passwordRules = {
    length: password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[@#$]/.test(password),
  };

  const passwordIsValid = Object.values(passwordRules).every(Boolean);
  const confirmMatches = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordIsValid) {
      toast.error('Please enter a valid password');
      return;
    }

    if (!confirmMatches) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/set-password', { token, password });
      toast.success('Password updated successfully. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to set password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingToken) {
    return (
      <div className="mx-auto max-w-md px-4 pt-24 pb-28 text-slate-700 sm:pt-28 sm:pb-32">
        Validating reset link...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 pt-24 pb-28 sm:pt-28 sm:pb-32">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Set up a new password</h1>
        <p className="mt-2 text-sm text-slate-600">
          {email ? `For ${email}` : 'Create your new password below.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-20 text-slate-900 outline-none ring-primary/20 focus:border-primary focus:ring-2"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              <p>{passwordRules.length ? '[x]' : '[ ]'} {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} characters</p>
              <p>{passwordRules.uppercase ? '[x]' : '[ ]'} At least one uppercase letter</p>
              <p>{passwordRules.number ? '[x]' : '[ ]'} At least one number</p>
              <p>{passwordRules.symbol ? '[x]' : '[ ]'} Include @, #, or $</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-20 text-slate-900 outline-none ring-primary/20 focus:border-primary focus:ring-2"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {confirmPassword.length > 0 && !confirmMatches && (
              <p className="mt-2 text-xs font-semibold text-red-500">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Confirm password'}
          </button>
        </form>
      </div>
    </div>
  );
}
