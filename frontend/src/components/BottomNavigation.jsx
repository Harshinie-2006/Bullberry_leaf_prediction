import React from 'react';
import { Camera, History, Info, Sparkles } from 'lucide-react';

export default function BottomNavigation({ currentTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${currentTab === 'scan' ? 'active' : ''}`}
        onClick={() => onTabChange('scan')}
      >
        <Camera size={22} strokeWidth={currentTab === 'scan' ? 2.5 : 2} />
        <span>Scan</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'history' ? 'active' : ''}`}
        onClick={() => onTabChange('history')}
      >
        <History size={22} strokeWidth={currentTab === 'history' ? 2.5 : 2} />
        <span>History</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'about' ? 'active' : ''}`}
        onClick={() => onTabChange('about')}
      >
        <Info size={22} strokeWidth={currentTab === 'about' ? 2.5 : 2} />
        <span>About</span>
      </button>
    </nav>
  );
}
