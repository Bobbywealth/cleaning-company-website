import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// No motion library
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = await login(username, password);
    
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-blue-700 blur-3xl" />
      </div>
      
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img
            src="https://iili.io/Btud5oF.th.png"
            alt="Cleaning Company Logo"
            className="h-20 w-20 rounded-2xl object-cover border border-white/10 shadow-lg shadow-cyan-500/20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-black">Admin Login</h1>
          <p className="text-slate-400 mt-2">Sign in to access the dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 outline-none focus:border-cyan-300 transition"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-3 outline-none focus:border-cyan-300 transition"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-3 text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 rounded-2xl py-6 text-base disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In 🔐'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-cyan-300 hover:text-cyan-200 text-sm"
          >
            ← Back to website
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default AdminLogin;
