import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const [mode, setMode]   = useState('login');
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    setLoading(true);

    // Password strength validation during registration
    if (!isLogin) {
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        setLoading(false);
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
        setError("Password must contain at least one special character.");
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate(returnTo === 'checkout' ? '/checkout' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <motion.div
      key="auth"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-[400px]">
        {returnTo === 'checkout' && (
          <div className="bg-ochre/10 border-l-[3px] border-ochre px-4 py-3 text-ochre-dark text-sm font-sans mb-8">
            🔒 Please log in to continue to checkout. Your cart has been saved.
          </div>
        )}
        
        <div className="text-center mb-10">
          <p className="text-[0.65rem] tracking-[0.25em] uppercase text-ochre font-sans font-bold mb-3">
            {isLogin ? 'Welcome back' : 'Join the studio'}
          </p>
          <h1 className="text-4xl font-serif text-charcoal">
            {isLogin ? 'Sign in' : 'Create account'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-[3px] border-red-500 px-4 py-3 text-red-900 text-sm font-sans mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {!isLogin && (
            <div>
              <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-charcoal/60 font-sans font-bold mb-2">
                Full Name
              </label>
              <input
                type="text" required value={form.name} onChange={update('name')}
                className="w-full bg-transparent border-b border-stone py-2 text-sm font-sans focus:outline-none focus:border-ochre transition-colors"
              />
            </div>
          )}
          
          <div>
            <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-charcoal/60 font-sans font-bold mb-2">
              Email
            </label>
            <input
              type="email" required value={form.email} onChange={update('email')}
              className="w-full bg-transparent border-b border-stone py-2 text-sm font-sans focus:outline-none focus:border-ochre transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-charcoal/60 font-sans font-bold mb-2">
              Password
            </label>
            <input
              type="password" required value={form.password} onChange={update('password')}
              className="w-full bg-transparent border-b border-stone py-2 text-sm font-sans focus:outline-none focus:border-ochre transition-colors"
            />
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full bg-charcoal text-white text-[0.7rem] tracking-[0.2em] font-bold uppercase py-4 mt-2 hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? '...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-charcoal/60 font-sans mt-8">
          {isLogin ? "New here? " : "Already have an account? "}
          <button onClick={() => setMode(isLogin ? 'signup' : 'login')}
            className="text-charcoal font-semibold underline underline-offset-4 decoration-stone hover:decoration-charcoal transition-colors">
            {isLogin ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </motion.div>
  );
}
