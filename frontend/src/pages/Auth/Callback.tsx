import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = params.get('token');
      const errorCode = params.get('error');

      if (errorCode) {
        let message = 'Google sign-in failed';
        if (errorCode === 'google_user_only') {
          message = 'Google sign-in is allowed only for user accounts. Admin and technician accounts must use email/password login.';
        } else if (errorCode === 'account_inactive') {
          message = 'Your account is inactive. Please contact support.';
        } else if (errorCode === 'google_email_not_available') {
          message = 'Google account email was not available. Please try a different account.';
        }

        setError(message);
        toast.error(message);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1000);
        return;
      }

      if (token) {
        try {
          login(token);
          toast.success('Welcome! Signed in with Google');
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 100);
        } catch (err: any) {
          console.error('Error during login:', err);
          setError('Failed to sign in');
          toast.error('Failed to sign in');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 100);
        }
      } else {
        setError('Invalid Google sign-in response');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 100);
      }
    };

    handleCallback();
  }, [params, login, navigate]);

  return (
    <div className="login-page">
      <div className="login-card" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {error ? (
          <div style={{ color: 'var(--danger)', fontSize: 14 }}>{error}</div>
        ) : (
          <div style={{ color: 'var(--text2)', fontSize: 14 }}>Signing you in...</div>
        )}
      </div>
    </div>
  );
}
