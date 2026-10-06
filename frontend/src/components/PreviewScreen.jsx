import React from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';

export default function PreviewScreen({ previewUrl, onChangeImage, onStartAnalysis }) {
  return (
    <div className="preview-container">
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a' }}>Image Preview</h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Check if the image is clear and the leaf is visible.
        </p>
      </div>

      {/* Main Preview Frame */}
      <div className="preview-image-box">
        <img src={previewUrl} alt="Leaf Preview" />
      </div>

      {/* Actions */}
      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button className="btn-secondary" onClick={onChangeImage}>
          <RefreshCw size={18} color="#15653b" />
          <span>Change image</span>
        </button>

        <button className="btn-primary" onClick={onStartAnalysis}>
          <span>Analyze Leaf</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
