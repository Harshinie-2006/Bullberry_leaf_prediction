import React from 'react';
import { AlertTriangle, Check, Camera, ImageIcon, RefreshCw } from 'lucide-react';

const TIPS = [
  "Keep the leaf fully visible",
  "Use good lighting",
  "Avoid blurry photos",
  "Keep the camera focused",
  "Avoid excessive background",
  "Capture the leaf closer to the camera"
];

export default function QualityPoorScreen({ previewUrl, onRetryCamera, onRetryUpload, onForceAnalyze }) {
  return (
    <div className="quality-poor-container">
      {/* Red Alert Icon (Screen 5) */}
      <div className="warning-icon-circle">
        <AlertTriangle size={38} />
      </div>

      <h2 className="quality-poor-title">Image Quality Poor</h2>
      <p className="quality-poor-desc">
        We couldn't clearly analyze this leaf. Please upload a clearer image with good lighting and keep the leaf visible.
      </p>

      {/* Tips for a Better Image */}
      <div className="tips-box">
        <div className="tips-title">Tips for a better image:</div>
        <ul className="tips-list">
          {TIPS.map((tip, idx) => (
            <li key={idx} className="tip-item">
              <span className="tip-icon">
                <Check size={12} strokeWidth={3} />
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Screen 6: Try a Better Photo Preview */}
      {previewUrl && (
        <div className="blurry-preview-box" title="Blurry or low contrast photo detected">
          <img src={previewUrl} alt="Poor Quality Preview" />
        </div>
      )}

      {/* Retry Action Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button className="btn-primary" onClick={onRetryUpload}>
          <RefreshCw size={18} />
          <span>Upload Again</span>
        </button>

        <button className="btn-secondary" onClick={onRetryCamera}>
          <Camera size={18} color="#15653b" />
          <span>Take Photo Again</span>
        </button>

        {onForceAnalyze && (
          <button 
            onClick={onForceAnalyze}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#64748b', 
              fontSize: '0.8rem', 
              cursor: 'pointer', 
              marginTop: '4px',
              textDecoration: 'underline'
            }}
          >
            Analyze Anyway (Force Diagnosis)
          </button>
        )}
      </div>
    </div>
  );
}
