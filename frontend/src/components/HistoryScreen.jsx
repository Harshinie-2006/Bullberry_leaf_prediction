import React, { useState, useEffect } from 'react';
import { ChevronRight, Trash2, Leaf, User, Calendar } from 'lucide-react';
import { fetchScanHistory, deleteScanHistory, getCurrentUser } from '../services/api';

export default function HistoryScreen({ onSelectHistoryItem, currentUser }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [currentUser]);

  const loadHistory = async () => {
    setLoading(true);
    const username = currentUser?.username || null;
    const items = await fetchScanHistory(username);
    setHistoryItems(items);
    setLoading(false);
  };

  const handleClear = async () => {
    const userName = currentUser?.name || currentUser?.username || 'your account';
    if (window.confirm(`Clear all scan history for ${userName}?`)) {
      await deleteScanHistory(currentUser?.username);
      setHistoryItems([]);
    }
  };

  const getStatusColorClass = (item) => {
    const sev = item.severity_level?.toLowerCase() || item.status_type || '';
    if (sev === 'healthy') return 'healthy';
    if (sev === 'mild') return 'mild';
    if (sev === 'severe') return 'severe';
    return 'moderate';
  };

  const userDisplayName = currentUser?.name || currentUser?.username || 'Guest';
  const userAvatar = currentUser?.avatar || '🌿';

  return (
    <div className="history-layout">
      {/* Header */}
      <div className="history-header">
        <div className="history-title-group">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Scan History
          </h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem' }}>
            <span style={{ fontSize: '1rem' }}>{userAvatar}</span>
            {userDisplayName}'s plant health log
          </p>
        </div>
        {historyItems.length > 0 && (
          <button className="clear-btn" onClick={handleClear} title="Clear Scan History">
            <Trash2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Clear
          </button>
        )}
      </div>

      {/* History Items List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px', animation: 'pulse 1s infinite' }}>🌿</div>
          Loading your scans...
        </div>
      ) : historyItems.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '50px 20px', color: '#64748b',
          background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0'
        }}>
          <Leaf size={42} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.05rem', color: '#1e293b', marginBottom: '6px' }}>
            No scans yet, {userDisplayName}!
          </h3>
          <p style={{ fontSize: '0.85rem' }}>
            Upload or take a photo of a leaf to start building your plant health log.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="history-card"
              onClick={() => onSelectHistoryItem?.(item)}
            >
              {/* Thumbnail */}
              <div className="history-thumb">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.class_name} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #0d3821, #15653b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                  }}>
                    <Leaf size={24} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="history-details">
                <span className="history-disease">{item.class_name}</span>
                <div className="history-meta">
                  <span className="conf">{item.confidence}%</span>
                  <span>•</span>
                  <span className={`sev-text ${getStatusColorClass(item)}`}>
                    {item.severity_level} ({item.affected_area_percent}%)
                  </span>
                </div>
                <span className="history-date">{item.timestamp}</span>
              </div>

              {/* Arrow */}
              <ChevronRight className="history-arrow" size={20} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
