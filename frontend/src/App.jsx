import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadScreen from './components/UploadScreen';
import PreviewScreen from './components/PreviewScreen';
import AnalyzingScreen from './components/AnalyzingScreen';
import ResultsScreen from './components/ResultsScreen';
import QualityPoorScreen from './components/QualityPoorScreen';
import HistoryScreen from './components/HistoryScreen';
import AboutScreen from './components/AboutScreen';
import BottomNavigation from './components/BottomNavigation';
import CameraModal from './components/CameraModal';
import AuthModal from './components/AuthModal';
import { predictLeafImage, getCurrentUser, initApiConnection, needsBackendSetup } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('scan'); // 'scan' | 'history' | 'about'
  const [screen, setScreen] = useState('home'); // 'home' | 'preview' | 'analyzing' | 'results' | 'quality_poor'
  const [isDesktopMode, setIsDesktopMode] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // User state - auto-set to default farmer
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    // Auto-detect and connect to the best reachable backend
    initApiConnection().then(setIsBackendConnected);

    // Periodically re-verify connection in background
    const interval = setInterval(() => {
      initApiConnection().then(setIsBackendConnected);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handle image selected from Upload Screen
  const handleImageSelected = (fileOrBlob, url) => {
    setSelectedImageFile(fileOrBlob);
    setPreviewUrl(url);
    setScreen('preview');
  };

  // Handle camera capture from modal
  const handleCameraCapture = (blob, url) => {
    setSelectedImageFile(blob);
    setPreviewUrl(url);
    setScreen('preview');
  };

  // Trigger analysis pipeline
  const handleStartAnalysis = async (force = false) => {
    if (!selectedImageFile) return;
    setScreen('analyzing');

    try {
      const username = currentUser?.username || null;
      const response = await predictLeafImage(selectedImageFile, force, username);

      setTimeout(() => {
        if (response.status === 'invalid_image') {
          alert(`⚠️ Invalid Image\n\n${response.message}`);
          setScreen('home');
        } else if (response.status === 'poor_quality') {
          setScreen('quality_poor');
        } else if (response.status === 'success') {
          setAnalysisResult(response.data);
          setScreen('results');
        } else {
          setScreen('quality_poor');
        }
      }, 2300);
    } catch (err) {
      console.error('Analysis error:', err);
      setTimeout(() => {
        setScreen('quality_poor');
      }, 1500);
    }
  };

  const handleScanAnother = () => {
    setSelectedImageFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setScreen('home');
    setCurrentTab('scan');
  };

  const handleBack = () => {
    if (currentTab !== 'scan') {
      setCurrentTab('scan');
      return;
    }
    if (screen === 'preview') setScreen('home');
    else if (screen === 'analyzing') setScreen('preview');
    else if (screen === 'results') setScreen('home');
    else if (screen === 'quality_poor') setScreen('home');
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (tab === 'scan') {
      if (screen !== 'results' && screen !== 'preview' && screen !== 'quality_poor') {
        setScreen('home');
      }
    }
  };

  const handleSelectHistoryItem = (historyItem) => {
    setAnalysisResult({
      prediction: {
        class_name: historyItem.class_name,
        confidence: historyItem.confidence,
        is_healthy: historyItem.class_name.toLowerCase().includes('healthy') || historyItem.class_name.toLowerCase().includes('free')
      },
      class_probabilities: [
        { class_name: historyItem.class_name, probability: historyItem.confidence, is_primary: true },
        { class_name: 'Leaf spot', probability: Math.max(0, 100 - historyItem.confidence), is_primary: false }
      ],
      severity: {
        level: historyItem.severity_level,
        affected_area_percent: historyItem.affected_area_percent,
        description: historyItem.recommendation_summary
      },
      visualizations: {
        original: historyItem.thumbnail,
        gradcam: historyItem.thumbnail,
        lesion_mask: historyItem.thumbnail
      },
      recommendations: [
        historyItem.recommendation_summary || "Maintain periodic leaf inspection and optimal nutrient balance."
      ]
    });
    setPreviewUrl(historyItem.thumbnail);
    setCurrentTab('scan');
    setScreen('results');
  };

  return (
    <div className="app-viewport">
      {/* Container simulating native mobile screen or desktop */}
      <div className={`device-container ${isDesktopMode ? 'desktop-mode' : ''}`}>
        {/* Header */}
        <Header
          currentScreen={currentTab !== 'scan' ? currentTab : screen}
          onBack={handleBack}
          onReset={handleScanAnother}
          isDesktopView={isDesktopMode}
          toggleDesktopView={() => setIsDesktopMode(prev => !prev)}
          currentUser={currentUser}
          isConnected={isBackendConnected}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Dynamic Screen Content */}
        <main className="app-content">
          {currentTab === 'history' ? (
            <HistoryScreen
              onSelectHistoryItem={handleSelectHistoryItem}
              currentUser={currentUser}
            />
          ) : currentTab === 'about' ? (
            <AboutScreen onConnectionChange={setIsBackendConnected} />
          ) : (
            <>
              {screen === 'home' && (
                <UploadScreen
                  onImageSelected={handleImageSelected}
                  onOpenLiveCamera={() => setIsCameraOpen(true)}
                />
              )}

              {screen === 'preview' && (
                <PreviewScreen
                  previewUrl={previewUrl}
                  onChangeImage={() => setScreen('home')}
                  onStartAnalysis={() => handleStartAnalysis(false)}
                />
              )}

              {screen === 'analyzing' && (
                <AnalyzingScreen />
              )}

              {screen === 'results' && (
                <ResultsScreen
                  resultData={analysisResult}
                  uploadedPreviewUrl={previewUrl}
                  onScanAnother={handleScanAnother}
                />
              )}

              {screen === 'quality_poor' && (
                <QualityPoorScreen
                  previewUrl={previewUrl}
                  onRetryCamera={() => {
                    setIsCameraOpen(true);
                  }}
                  onRetryUpload={() => setScreen('home')}
                  onForceAnalyze={() => handleStartAnalysis(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation
          currentTab={currentTab}
          onTabChange={handleTabChange}
        />

        {/* Live Camera Viewfinder Modal */}
        <CameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCameraCapture}
        />

        {/* User Login & Registration Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
          }}
          canSkip={true}
          onSkip={() => setIsAuthModalOpen(false)}
        />
      </div>
    </div>
  );
}
