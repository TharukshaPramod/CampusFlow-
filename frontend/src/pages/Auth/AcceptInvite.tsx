import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api/client";

/**
 * AcceptInvite — Admin/Technician invitation acceptance page.
 *
 * Flow:
 *  1. On mount, the invite token from the URL is verified with the backend.
 *  2. Step "password" — the invited user creates their account password.
 *  3. Step "otp"      — a 6-digit OTP is sent to their email; they enter it to confirm.
 *  4. On success, all auth data is cleared and the user is sent to /login to sign in fresh.
 *
 * The page is only reachable via an invitation link that contains a ?token= query param.
 */

// Defines the two sequential steps of the invite acceptance flow
type Step = "password" | "otp";

// Shape of the invite metadata returned by the backend after token verification
type InviteMeta = {
  name: string; // Invitee's display name
  email: string; // Invitee's email address
  role: string; // Role being granted (e.g. "ADMIN", "TECHNICIAN")
};

const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 8;

const passwordRules = {
  minLength: (v: string) => v.length >= PASSWORD_MIN_LENGTH,
  maxLength: (v: string) => v.length <= PASSWORD_MAX_LENGTH,
  uppercase: (v: string) => /[A-Z]/.test(v),
  number: (v: string) => /\d/.test(v),
  symbol: (v: string) => /[@#$!%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(v),
};
/**
 * Returns true only when every password rule passes.
 * Used as a gate before the password step API call.
 */
const isValidPassword = (value: string) =>
  passwordRules.minLength(value) &&
  passwordRules.maxLength(value) &&
  passwordRules.uppercase(value) &&
  passwordRules.number(value) &&
  passwordRules.symbol(value);

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  // Extract the invite token from the URL — e.g. /accept-invite?token=abc123
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  // True while the initial token verification request is in flight
  const [loading, setLoading] = useState(true);
  // Tracks which step of the two-step flow is currently active
  const [step, setStep] = useState<Step>("password");
  // Invite metadata populated after successful token verification
  const [meta, setMeta] = useState<InviteMeta | null>(null);
  // Controlled input values for the password and OTP fields
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
   // True while a form submission API call is in progress (prevents double-submit)
  const [submitting, setSubmitting] = useState(false);

  /**
   * On mount, verify the invite token with the backend.
   * - If the token is missing or invalid, redirect immediately to /login.
   * - On success, store the invitee metadata for display in the UI.
   */
  useEffect(() => {
    const verifyInvite = async () => {
      // Guard: a missing token means the URL is malformed or the link was opened incorrectly
      if (!token) {
        toast.error("Invitation token is missing");
        navigate("/login", { replace: true });
        return;
      }

      setLoading(true);
      try {
        const res = await api.get("/auth/verify-admin-invite", { params: { token } });
        // Store invitee info (name, email, role) for display in the card header
        setMeta(res.data);
      } catch (err: any) {
        // Token is expired, already used, or tampered with
        toast.error(err?.response?.data?.message || "Invalid invitation link");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifyInvite();
  }, [token, navigate]);  // Re-runs if the token in the URL changes

  /**
   * Step 1 — Password submission.
   * Validates the password locally before sending it to the backend.
   * On success, the backend triggers an OTP email and we advance to the OTP step.
   */

  const submitPassword = async () => {
    // Client-side validation guard — avoids an unnecessary network round-trip
    if (!isValidPassword(password)) {
      toast.error("Enter a strong valid password");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/accept-admin-invite", { token, password });
      toast.success("Password set. OTP sent to your email.");
      setStep("otp");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to set password");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Step 2 — OTP verification.
   * Validates that the OTP is exactly 6 digits before calling the backend.
   * On success, clears all stored auth state and hard-redirects to /login
   * so the user must sign in with their newly created credentials.
   */
  const submitOtp = async () => {
    // Basic format check — must be exactly 6 numeric digits
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/verify-admin-invite-otp", { token, code: otp.trim() });
      toast.success("Verification complete. Please login.");

      // Clear any existing session so the user starts fresh at /login
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      // Use window.location.replace (not navigate) to force a full page reload,
      // ensuring all in-memory auth state in React context is also wiped
      window.location.replace("/login");
      return;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-md px-4 pt-24 pb-28 text-slate-700 sm:pt-28 sm:pb-32">Loading invitation...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 pt-24 pb-28 sm:pt-28 sm:pb-32">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Admin Invitation</h1>
        <p className="mt-2 text-sm text-slate-600">
          {meta?.name} ({meta?.email}) invited as {meta?.role}
        </p>

        {step === "password" ? (
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Create password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-primary/20 focus:border-primary focus:ring-2"
              />
              <div className="mt-2 text-xs text-slate-500">
                <p>{passwordRules.minLength(password) ? "[x]" : "[ ]"} {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} characters</p>
                <p>{passwordRules.uppercase(password) ? "[x]" : "[ ]"} One uppercase letter</p>
                <p>{passwordRules.number(password) ? "[x]" : "[ ]"} One number</p>
                <p>{passwordRules.symbol(password) ? "[x]" : "[ ]"} One symbol</p>
              </div>
            </div>

            <button
              type="button"
              onClick={submitPassword}
              disabled={submitting}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Processing..." : "Set Password"}
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Enter OTP</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-primary/20 focus:border-primary focus:ring-2"
              />
            </div>

            <button
              type="button"
              onClick={submitOtp}
              disabled={submitting}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
