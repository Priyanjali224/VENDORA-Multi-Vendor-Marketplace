import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck, Store, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login(email, password);
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to VENDORA</h1>
          <p className="text-xs text-slate-500">Access your customer orders, vendor store, or administrator console</p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            1-Click Demo Quick Fill
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@vendora.com', 'customerPassword123')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 font-bold text-slate-700 transition flex items-center justify-center gap-1"
            >
              <User className="w-3 h-3 text-blue-500" /> Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('apex@vendora.com', 'vendorPassword123')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-600 font-bold text-slate-700 transition flex items-center justify-center gap-1"
            >
              <Store className="w-3 h-3 text-amber-500" /> Vendor
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@vendora.com', 'adminPassword123')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 font-bold text-slate-700 transition flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-indigo-500" /> Admin
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 space-y-1">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Create Customer Account
            </Link>
          </p>
          <p>
            Want to sell on Vendora?{' '}
            <Link to="/register-vendor" className="text-amber-600 font-bold hover:underline">
              Register Merchant Store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
