import React, { useEffect, useState } from 'react';
import { Sprout, Cpu, ShieldCheck, Database, Server, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { fetchModelInfo, getEffectiveApiUrl, setCustomApiUrl, testApiConnection, autoDetectBackend, needsBackendSetup } from '../services/api';

export default function AboutScreen({ onConnectionChange }) {
  const [modelInfo, setModelInfo] = useState(null);
  const [serverUrl, setServerUrl] = useState(getEffectiveApiUrl());
  const [testStatus, setTestStatus] = useState(null); // 'testing', 'connected', 'failed'

  useEffect(() => {
    fetchModelInfo().then(info => setModelInfo(info));
  }, []);

  const handleSaveUrl = async () => {
    setTestStatus('testing');
    setCustomApiUrl(serverUrl);
    const ok = await testApiConnection(serverUrl);
    setTestStatus(ok ? 'connected' : 'failed');
    onConnectionChange?.(ok);
    if (ok) {
      fetchModelInfo().then(info => setModelInfo(info));
    }
  };

  const handleResetUrl = () => {
    setCustomApiUrl('');
    const def = getEffectiveApiUrl();
    setServerUrl(def);
    setTestStatus(null);
    fetchModelInfo().then(info => setModelInfo(info));
  };

  return (
    <div className="about-screen">
      <div className="about-card" style={{ background: 'linear-gradient(135deg, #0d3821 0%, #15653b 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Sprout size={28} color="#a7f3d0" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>About BerryIO</h2>
        </div>
        <p style={{ color: '#d1fae5', fontSize: '0.88rem' }}>
          BerryIO is an intelligent agricultural computer vision platform designed to diagnose crop foliage diseases in real time using deep learning, Grad-CAM attention localization, and lesion surface severity analysis — with multi-user accounts so every farmer tracks their own plant health history.
        </p>
      </div>

      {/* Mobile Backend Server Settings */}
      <div className="about-card" style={{ border: '1.5px solid #bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={20} color="#15653b" />
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Backend Server Connection</h3>
          </div>
          <button
            onClick={async () => {
              setTestStatus('testing');
              const found = await autoDetectBackend();
              if (found) {
                setServerUrl(found);
                setTestStatus('connected');
                onConnectionChange?.(true);
                fetchModelInfo().then(info => setModelInfo(info));
              } else {
                setTestStatus('failed');
                onConnectionChange?.(false);
              }
            }}
            disabled={testStatus === 'testing'}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#047857',
              color: '#fff',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Scan all known local IPs and connect automatically"
          >
            <RefreshCw size={12} className={testStatus === 'testing' ? 'spin' : ''} />
            Auto-Detect
          </button>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '10px' }}>
          Choose your network mode or enter your server URL below, then tap <strong>Save &amp; Test</strong>:
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {[
            { label: 'Wi-Fi (10.1.51.42)', url: 'http://10.1.51.42:8000' },
            { label: 'Phone Hotspot (172.20.90.108)', url: 'http://172.20.90.108:8000' },
            { label: 'PC Hotspot (192.168.137.1)', url: 'http://192.168.137.1:8000' },
            { label: 'USB Cable (localhost)', url: 'http://localhost:8000' },
            { label: 'Emulator (10.0.2.2)', url: 'http://10.0.2.2:8000' }
          ].map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => {
                setServerUrl(preset.url);
                setTestStatus('testing');
                testApiConnection(preset.url).then((ok) => {
                  setTestStatus(ok ? 'connected' : 'failed');
                  onConnectionChange?.(ok);
                  if (ok) {
                    fetchModelInfo().then(info => setModelInfo(info));
                  }
                });
              }}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '6px',
                border: serverUrl === preset.url ? '1.5px solid #15653b' : '1px solid #cbd5e1',
                backgroundColor: serverUrl === preset.url ? '#ecfdf5' : '#f8fafc',
                color: serverUrl === preset.url ? '#065f46' : '#334155',
                fontWeight: serverUrl === preset.url ? '600' : '500',
                cursor: 'pointer'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://10.1.51.42:8000"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              fontFamily: 'monospace'
            }}
          />
          <button
            onClick={handleSaveUrl}
            disabled={testStatus === 'testing'}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#15653b',
              color: '#fff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {testStatus === 'testing' ? 'Testing...' : 'Save & Test'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {testStatus === 'connected' && (
            <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={15} /> Connected to Backend Server
            </span>
          )}
          {testStatus === 'failed' && (
            <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <XCircle size={15} /> Could not connect. Check network.
            </span>
          )}
          {testStatus === null && <span />}

          <button
            onClick={handleResetUrl}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Reset Default
          </button>
        </div>

        <div style={{ marginTop: '10px', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#475569', lineHeight: '1.4' }}>
          💡 <strong>College / Campus Wi-Fi Note:</strong> Campus networks (e.g. Kongu_Wifi) often block phone-to-PC connections. If connection fails, switch your phone to <strong>Mobile Hotspot</strong>, connect your laptop to it, and tap <strong>Phone Hotspot</strong> above!
        </div>
      </div>

      <div className="about-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Cpu size={20} color="#15653b" />
          <h3>Model Status & Architecture</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
          <div>
            <strong>Engine:</strong> <span className="code-badge">{modelInfo?.model_type || 'PyTorch / Intelligent Agricultural Engine'}</span>
          </div>
          <div>
            <strong>Inference Device:</strong> <span className="code-badge">{modelInfo?.device || 'CPU'}</span>
          </div>
          <div>
            <strong>Custom Colab Model:</strong> {modelInfo?.is_custom_model_loaded ? '✅ Active' : '⚡ High-Fidelity Agricultural Engine Active'}
          </div>
        </div>
      </div>

      <div className="about-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Database size={20} color="#15653b" />
          <h3>How to Drop in Your Google Colab Model</h3>
        </div>
        <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Export your model from Colab as <span className="code-badge">berryio_model.pt</span> or <span className="code-badge">.onnx</span> or <span className="code-badge">.h5</span></li>
          <li>Save the file in the <span className="code-badge">backend/models/</span> directory.</li>
          <li>BerryIO will automatically detect and load your weights on server restart!</li>
        </ol>
      </div>

      <div className="about-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ShieldCheck size={20} color="#15653b" />
          <h3>Supported Diseases</h3>
        </div>
        <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li><strong>Leaf Rust:</strong> Orange-brown pustules caused by fungal spores.</li>
          <li><strong>Leaf Spot:</strong> Dark necrotic circular lesions with chlorotic halos.</li>
          <li><strong>Powdery Mildew:</strong> White talcum-like fungal coating on upper foliage.</li>
          <li><strong>Bacterial Blight:</strong> Water-soaked angular lesions expanding into necrosis.</li>
          <li><strong>Disease Free:</strong> Healthy, vibrant leaf foliage with optimal chlorophyll.</li>
        </ul>
      </div>
    </div>
  );
}
