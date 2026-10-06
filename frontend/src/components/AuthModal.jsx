import React, { useState, useEffect } from 'react';
import { X, Leaf, Eye, EyeOff, User, Lock, Sprout, ChevronRight, LogIn, UserPlus } from 'lucide-react';
import { apiLogin, apiRegister, fetchDemoUsers, quickLoginAs } from '../services/api';

export default function AuthModal({ isOpen, onLoginSuccess, canSkip = false, onSkip }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoUsers, setDemoUsers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchDemoUsers().then(users => setDemoUsers(users));
      setError('');
      setUsername('');
      setPassword('');
      setName('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let result;
      if (mode === 'login') {
        result = await apiLogin(username.trim().toLowerCase(), password);
      } else {
        result = await apiRegister(username.trim().toLowerCase(), password, name, 'Farmer', '🌿');
      }
      onLoginSuccess(result.user);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoUser) => {
    const user = quickLoginAs(demoUser);
    onLoginSuccess(user);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '400px',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        animation: 'slideInModal 0.3s ease'
      }}>
        {/* Header Gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #0d3821 0%, #15653b 60%, #22c55e 100%)',
          padding: '28px 24px 20px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sprout size={22} color="#a7f3d0" />
            </div>
            <span style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              BerryIO
            </span>
          </div>
          <p style={{ color: '#bbf7d0', fontSize: '0.82rem', margin: 0 }}>
            {mode === 'login' ? 'Sign in to your plant health account' : 'Create your BerryIO account'}
          </p>
          {canSkip && (
            <button
              onClick={onSkip}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff'
              }}
              title="Continue as Guest"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {/* Quick Demo Login Buttons */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Quick Demo Login
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {demoUsers.map(user => (
                <button
                  key={user.username}
                  onClick={() => handleDemoLogin(user)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#15653b'; e.currentTarget.style.background = '#f0fdf4'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{user.avatar}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1e293b' }}>{user.name}</span>
                  <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{user.role}</span>
                </button>
              ))}
              {demoUsers.length === 0 && (
                <>
                  {[
                    { username: 'john', name: 'Farmer John', role: 'Farmer', avatar: '👨‍🌾', token: 'john:demo' },
                    { username: 'sarah', name: 'Farmer Sarah', role: 'Farmer', avatar: '👩‍🌾', token: 'sarah:demo' }
                  ].map(user => (
                    <button key={user.username} onClick={() => handleDemoLogin(user)}
                      style={{ flex: 1, padding: '10px 8px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{user.avatar}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#1e293b' }}>{user.name}</span>
                      <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{user.role}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Mode Toggle */}
          <div style={{
            display: 'flex', background: '#f1f5f9', borderRadius: '10px',
            padding: '3px', marginBottom: '16px'
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                  background: mode === m ? '#fff' : 'transparent',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700',
                  color: mode === m ? '#15653b' : '#64748b',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                {m === 'login' ? <LogIn size={13} /> : <UserPlus size={13} />}
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Farmer John"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '10px 12px 10px 32px',
                      borderRadius: '10px', border: '1.5px solid #e2e8f0',
                      fontSize: '0.85rem', outline: 'none',
                      fontFamily: 'inherit'
                    }}
                    onFocus={e => e.target.style.borderColor = '#15653b'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <Leaf size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={mode === 'login' ? 'john or sarah' : 'your_username'}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 12px 10px 32px',
                    borderRadius: '10px', border: '1.5px solid #e2e8f0',
                    fontSize: '0.85rem', outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#15653b'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? 'password123' : 'min. 4 characters'}
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 36px 10px 32px',
                    borderRadius: '10px', border: '1.5px solid #e2e8f0',
                    fontSize: '0.85rem', outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#15653b'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', padding: '2px'
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '8px', padding: '8px 12px',
                fontSize: '0.78rem', color: '#dc2626'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                borderRadius: '12px', border: 'none',
                background: loading ? '#86efac' : 'linear-gradient(135deg, #15653b, #22c55e)',
                color: '#fff', fontWeight: '700', fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.2s ease',
                marginTop: '4px',
                fontFamily: 'inherit'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>🌿</span>
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
                  {mode === 'login' ? 'Sign In to BerryIO' : 'Create My Account'}
                </>
              )}
            </button>

            {mode === 'login' && (
              <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>
                Demo: username <strong>john</strong> or <strong>sarah</strong>, password <strong>password123</strong>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
