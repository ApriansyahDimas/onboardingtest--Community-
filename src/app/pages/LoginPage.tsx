import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import logoImg from '../../assets/imajin-logo.svg';

export function LoginPage() {
  const { login, state } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      setLoading(false);
      if (ok) {
        const user = state.users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (user?.role === 'ADMIN') {
          navigate('/admin/tasks', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError('Invalid email or password.');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center">
      {/* Purple brand header */}
      <div
        className="w-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--brand-gradient)', height: 160 }}
      >
        <img
          src={logoImg}
          alt="Imajin"
          style={{ height: 40, objectFit: 'contain' }}
        />
      </div>

      {/* Form container */}
      <div
        className="flex-1 flex flex-col items-center px-6 pt-10"
        style={{ maxWidth: 460, margin: '0 auto', width: '100%' }}
      >
        <div className="w-full mb-8">
          <h1
            className="text-[#111111]"
            style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 4 }}
          >
            Sign in
          </h1>
          <p className="text-[#666666] text-sm">Welcome back. Enter your credentials to continue.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm text-[#111111] mb-1" style={{ fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full border border-[#eeeeee] rounded-xl px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#7f15a8] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-[#111111] mb-1" style={{ fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full border border-[#eeeeee] rounded-xl px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#7f15a8] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-white text-sm transition-opacity disabled:opacity-60"
            style={{ background: 'var(--brand-gradient)', fontWeight: 600 }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="mt-8 w-full border border-[#eeeeee] rounded-xl p-4">
          <p className="text-xs text-[#666666] mb-2" style={{ fontWeight: 600 }}>
            Demo accounts
          </p>
          <div className="space-y-1">
            <p className="text-xs text-[#666666]">
              Admin: <span className="text-[#111111]">alice@company.com</span> / admin123
            </p>
            <p className="text-xs text-[#666666]">
              User: <span className="text-[#111111]">bob@company.com</span> / user123
            </p>
            <p className="text-xs text-[#666666]">
              User: <span className="text-[#111111]">carol@company.com</span> / user123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


