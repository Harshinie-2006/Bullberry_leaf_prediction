import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // Rear camera for leaves

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    async function startCamera() {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 1080 }, height: { ideal: 1080 } },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
        setCameraError('Camera access unavailable. You can also pick an image from your device or use sample leaves.');
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        onCapture(blob, previewUrl);
        onClose();
      }
    }, 'image/jpeg', 0.95);
  };

  if (!isOpen) return null;

  return (
    <div className="camera-modal-overlay">
      <div className="camera-card">
        <div className="camera-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color="#22c55e" />
            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Align Leaf in Center</span>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="camera-viewfinder">
          {cameraError ? (
            <div style={{ padding: '24px', color: '#fca5a5', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
              <AlertCircle size={36} color="#ef4444" />
              <p style={{ fontSize: '0.85rem' }}>{cameraError}</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted />
              <div className="viewfinder-target" />
            </>
          )}
        </div>

        <div className="camera-actions">
          <button 
            onClick={toggleCamera} 
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Switch Camera"
          >
            <RefreshCw size={20} />
          </button>

          <button 
            className="shutter-btn" 
            onClick={capturePhoto}
            title="Take Photo"
          />

          <div style={{ width: '44px' }} />
        </div>
      </div>
    </div>
  );
}
