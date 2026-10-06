import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, UploadCloud, Sparkles } from 'lucide-react';
import { getSampleLeafBlob, createSampleLeafCanvas } from '../services/sampleImages';

export default function UploadScreen({ onImageSelected, onOpenLiveCamera }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onImageSelected(file, previewUrl);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      onImageSelected(file, previewUrl);
    }
  };

  const handleSampleClick = (type) => {
    const blob = getSampleLeafBlob(type);
    const previewUrl = createSampleLeafCanvas(type);
    onImageSelected(blob, previewUrl);
  };

  return (
    <div className="upload-screen">
      {/* Hero Banner (Screen 1) */}
      <div className="hero-card">
        <h1 className="hero-title">BerryIo</h1>
        <p className="hero-subtitle">AI-Powered Leaf Disease Detection</p>
        <span className="hero-tagline">Healthy Plants · Better Harvests · Brighter Future</span>
      </div>

      {/* Main Upload Card */}
      <div className="section-card">
        <h2 className="section-title">Scan Your Leaf</h2>
        <p className="section-desc">
          Upload a photo or take a picture of a leaf to get an AI-powered diagnosis.
        </p>

        {/* Action 1: Take Photo */}
        <button className="btn-primary" onClick={onOpenLiveCamera}>
          <Camera size={20} />
          <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
            <div>Take Photo</div>
            <div style={{ fontSize: '0.72rem', fontWeight: '400', opacity: 0.85 }}>Use your camera</div>
          </div>
        </button>

        {/* Action 2: Choose Image */}
        <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon size={20} color="#15653b" />
          <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
            <div>Choose Image</div>
            <div style={{ fontSize: '0.72rem', fontWeight: '400', color: '#64748b' }}>Pick from your device</div>
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Action 3: Drag & Drop */}
        <div
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud size={28} color="#15653b" />
          <span className="dropzone-text">Drag & Drop Image</span>
          <span className="dropzone-subtext">or click to browse from files</span>
        </div>

        {/* Sample Leaves for Quick Demonstration */}
        <div className="sample-bar">
          <div className="sample-bar-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} color="#f59e0b" />
            <span>Try Pre-Generated Sample Leaves:</span>
          </div>
          <div className="sample-chips">
            <button className="sample-chip" onClick={() => handleSampleClick('rust')}>
              🍂 Leaf Rust
            </button>
            <button className="sample-chip" onClick={() => handleSampleClick('spot')}>
              🌿 Leaf Spot
            </button>
            <button className="sample-chip" onClick={() => handleSampleClick('healthy')}>
              ✨ Disease-Free Leaf
            </button>
            <button className="sample-chip" onClick={() => handleSampleClick('blurry')} style={{ color: '#dc2626' }}>
              ⚠️ Blurry (Quality Test)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
