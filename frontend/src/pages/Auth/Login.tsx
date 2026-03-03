function Login() {
  return (
    <section className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-800">Sign in</h1>
      <p className="text-slate-600">Connect with your campus account to continue.</p>
      <button className="w-full rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark">
        Continue with SSO
      </button>
    </section>
  );
}

export default Login;
