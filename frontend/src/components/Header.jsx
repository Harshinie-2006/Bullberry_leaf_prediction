import React from 'react';
import { Leaf, ArrowLeft, Smartphone, Monitor, Server } from 'lucide-react';
import { API_BASE_URL, getEffectiveApiUrl, isNativeApp } from '../services/api';

export default function Header({ currentScreen, onBack, onReset, isDesktopView, toggleDesktopView, currentUser, isConnected, onOpenAuth }) {
  const showBack = currentScreen !== 'home' && currentScreen !== 'history' && currentScreen !== 'about';
  const activeUrl = API_BASE_URL || getEffectiveApiUrl();
  const nativeApp = isNativeApp();
  const serverHost = activeUrl ? activeUrl.replace(/^https?:\/\//, '') : 'Not configured';

  return (
    <header className="app-header">
      <div className="header-left">
        {showBack ? (
          <button className="header-back-btn" onClick={onBack} title="Go Back">
            <ArrowLeft size={22} />
          </button>
        ) : null}

        <div className="header-brand" onClick={onReset} title="BerryIo Home">
          <div className="header-brand-icon">
            <Leaf size={18} color="#fff" />
          </div>
          <div className="header-brand-text">
            <span className="header-brand-name">BerryIo</span>
            <span className="header-brand-tagline">AI Leaf Diagnosis</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <div
          className={`header-server-badge ${isConnected ? 'connected' : 'disconnected'}`}
          title={activeUrl ? `Backend: ${activeUrl}` : 'Backend not configured — open About to set your PC IP'}
        >
          <Server size={11} />
          <span className="header-server-url">{serverHost}</span>
        </div>

        {!nativeApp && (
          <button
            className="mode-btn"
            onClick={toggleDesktopView}
            title={isDesktopView ? 'Switch to Mobile View' : 'Switch to Desktop Card View'}
          >
            {isDesktopView ? (
              <span className="mode-btn-label">
                <Smartphone size={14} /> Mobile
              </span>
            ) : (
              <span className="mode-btn-label">
                <Monitor size={14} /> Desktop
              </span>
            )}
          </button>
        )}

        {currentUser ? (
          <div
            className="header-user-pill"
            title={`Connected as: ${currentUser.name}. Click to switch account.`}
            onClick={onOpenAuth}
            style={{ cursor: 'pointer' }}
          >
            <span className="header-user-avatar">{currentUser.avatar || '🌿'}</span>
            <span className="header-user-name">
              {currentUser.name?.split(' ')[0] || currentUser.username}
            </span>
          </div>
        ) : (
          <button
            className="mode-btn"
            onClick={onOpenAuth}
            title="Sign in or Switch Account"
            style={{ background: '#15653b', color: '#fff', border: 'none' }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
