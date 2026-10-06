import React, { useState, useEffect } from 'react';
import { Leaf, RefreshCw, AlertTriangle, CheckCircle, ShieldCheck, Download, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultsScreen({ resultData, uploadedPreviewUrl, onScanAnother }) {
  const [activeTab, setActiveTab] = useState('original'); // 'original' | 'gradcam' | 'lesion_mask'

  const prediction = resultData?.prediction || { class_name: 'Leaf Rust', confidence: 94.32, is_healthy: false };
  const probabilities = resultData?.class_probabilities || [
    { class_name: 'Disease Free leaves', probability: 2.13, is_primary: false },
    { class_name: 'Leaf Rust', probability: 94.32, is_primary: true },
    { class_name: 'Leaf spot', probability: 3.55, is_primary: false }
  ];
  const severity = resultData?.severity || { level: 'Moderate', affected_area_percent: 17.4, description: '' };
  const visualizations = resultData?.visualizations || {};
  const recommendations = resultData?.recommendations || [];

  const originalImg = visualizations.original || uploadedPreviewUrl;
  const gradcamImg = visualizations.gradcam || originalImg;
  const lesionMaskImg = visualizations.lesion_mask || originalImg;

  useEffect(() => {
    if (prediction.is_healthy) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#15803d', '#86efac']
      });
    }
  }, [prediction.is_healthy]);

  const getProgressColorClass = (className) => {
    const lower = className.toLowerCase();
    if (lower.includes('free') || lower.includes('healthy')) return 'healthy';
    if (lower.includes('rust')) return 'rust';
    if (lower.includes('spot')) return 'spot';
    return 'other';
  };

  const getActiveImage = () => {
    if (activeTab === 'gradcam') return gradcamImg;
    if (activeTab === 'lesion_mask') return lesionMaskImg;
    return originalImg;
  };

  const getSeverityClass = (level) => {
    const l = level?.toLowerCase() || '';
    if (l === 'healthy') return 'healthy';
    if (l === 'mild') return 'mild';
    if (l === 'severe') return 'severe';
    return 'moderate';
  };

  return (
    <div className="results-container">
      {/* 1. Main Diagnosis Hero Card (Screen 4) */}
      <div className="diagnosis-hero-card">
        <div className={`diagnosis-badge-circle ${prediction.is_healthy ? '' : severity.level === 'Severe' ? 'danger' : 'warning'}`}>
          {prediction.is_healthy ? <ShieldCheck size={32} /> : <Leaf size={30} />}
        </div>
        <div className="diagnosis-info">
          <div className="diagnosis-name">{prediction.class_name}</div>
          <div className="diagnosis-conf">{prediction.confidence}% Confidence</div>
        </div>
      </div>

      {/* 2. Class Probabilities Breakdown */}
      <div className="probabilities-card">
        <div className="card-heading">Class Probabilities</div>
        <div className="prob-list">
          {probabilities.map((item, idx) => (
            <div key={idx} className="prob-row">
              <span className="prob-name">{item.class_name}</span>
              <div className="prob-bar-track">
                <div
                  className={`prob-bar-fill ${getProgressColorClass(item.class_name)}`}
                  style={{ width: `${Math.max(item.probability, 2)}%` }}
                />
              </div>
              <span className="prob-value">{item.probability}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Visual Analysis Tabs (Original, Grad-CAM, Lesion Mask) */}
      <div className="visuals-card">
        <div className="visual-tabs">
          <button
            className={`visual-tab-btn ${activeTab === 'original' ? 'active' : ''}`}
            onClick={() => setActiveTab('original')}
          >
            Original
          </button>
          <button
            className={`visual-tab-btn ${activeTab === 'gradcam' ? 'active' : ''}`}
            onClick={() => setActiveTab('gradcam')}
          >
            Grad-CAM
          </button>
          <button
            className={`visual-tab-btn ${activeTab === 'lesion_mask' ? 'active' : ''}`}
            onClick={() => setActiveTab('lesion_mask')}
          >
            Lesion Mask
          </button>
        </div>

        {/* 3 Thumbnails Side-by-Side */}
        <div className="visual-grid">
          <div
            className={`visual-preview-item ${activeTab === 'original' ? 'selected' : ''}`}
            onClick={() => setActiveTab('original')}
          >
            <div className="img-box">
              <img src={originalImg} alt="Original Leaf" />
            </div>
            <span className="visual-label">Original</span>
          </div>

          <div
            className={`visual-preview-item ${activeTab === 'gradcam' ? 'selected' : ''}`}
            onClick={() => setActiveTab('gradcam')}
          >
            <div className="img-box">
              <img src={gradcamImg} alt="Grad-CAM Heatmap" />
            </div>
            <span className="visual-label">Grad-CAM</span>
          </div>

          <div
            className={`visual-preview-item ${activeTab === 'lesion_mask' ? 'selected' : ''}`}
            onClick={() => setActiveTab('lesion_mask')}
          >
            <div className="img-box">
              <img src={lesionMaskImg} alt="Lesion Mask" />
            </div>
            <span className="visual-label">Lesion Mask</span>
          </div>
        </div>

        {/* Enlarged view of the currently selected tab */}
        <div className="active-visual-full">
          <img src={getActiveImage()} alt="Selected Visual" />
        </div>
      </div>

      {/* 4. Estimated Severity Card */}
      <div className="severity-card">
        <div className="severity-left">
          <span className="severity-title">Estimated Severity</span>
          <div className="severity-badge-row">
            <span className={`severity-tag ${getSeverityClass(severity.level)}`}>
              {severity.level}
            </span>
            <span className="severity-area">
              {severity.affected_area_percent}% affected leaf area
            </span>
          </div>
        </div>
        <Leaf className="severity-icon" size={28} />
      </div>

      {/* 5. Recommendations Card */}
      {recommendations && recommendations.length > 0 && (
        <div className="recommendations-card">
          <div className="card-heading" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Leaf size={16} color="#15653b" />
            <span>Recommended Actions</span>
          </div>
          <ul className="rec-list">
            {recommendations.map((rec, i) => (
              <li key={i} className="rec-item">
                <span className="rec-bullet">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 6. Scan Another Action Button */}
      <div style={{ marginTop: '8px' }}>
        <button className="btn-primary" onClick={onScanAnother}>
          <RefreshCw size={18} />
          <span>Scan Another Leaf</span>
        </button>
      </div>
    </div>
  );
}
