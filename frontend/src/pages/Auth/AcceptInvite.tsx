import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api/client";

type Step = "password" | "otp";

type InviteMeta = {
  name: string;
  email: string;
  role: string;
};

const passwordRules = {
  minLength: (v: string) => v.length >= 6,
  maxLength: (v: string) => v.length <= 20,
  uppercase: (v: string) => /[A-Z]/.test(v),
  number: (v: string) => /\d/.test(v),
  symbol: (v: string) => /[@#$!%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(v),
};

const isValidPassword = (value: string) =>
  passwordRules.minLength(value) &&
  passwordRules.maxLength(value) &&
  passwordRules.uppercase(value) &&
  passwordRules.number(value) &&
  passwordRules.symbol(value);

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("password");
  const [meta, setMeta] = useState<InviteMeta | null>(null);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const verifyInvite = async () => {
      if (!token) {
        toast.error("Invitation token is missing");
        navigate("/login", { replace: true });
        return;
      }

      setLoading(true);
      try {
        const res = await api.get("/auth/verify-admin-invite", { params: { token } });
        setMeta(res.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Invalid invitation link");
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifyInvite();
  }, [token, navigate]);

  const submitPassword = async () => {
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

  const submitOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/verify-admin-invite-otp", { token, code: otp.trim() });
      toast.success("Verification complete. Please login.");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-primary/20 focus:border-primary focus:ring-2"
              />
              <div className="mt-2 text-xs text-slate-500">
                <p>{passwordRules.minLength(password) ? "[x]" : "[ ]"} At least 6 characters</p>
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
