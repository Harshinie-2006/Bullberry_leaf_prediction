import React, { useEffect, useState } from 'react';
import { Leaf, CheckCircle2, Loader2, Circle } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Check image quality' },
  { id: 2, title: 'Detect leaf region' },
  { id: 3, title: 'Disease classification' },
  { id: 4, title: 'Grad-CAM generation' },
  { id: 5, title: 'Severity estimation' }
];

export default function AnalyzingScreen({ onAnalysisComplete, analysisPromise }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    // Step animation cadence
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="analyzing-container">
      {/* Animated Circular Spinner with Leaf (Screen 3) */}
      <div className="spinner-outer">
        <svg className="circular-progress-svg" viewBox="0 0 100 100">
          <circle className="progress-track" cx="50" cy="50" r="45" />
          <circle className="progress-indicator" cx="50" cy="50" r="45" />
        </svg>
        <Leaf className="leaf-center-icon" size={38} />
      </div>

      <h2 className="analyzing-title">Analyzing Your Leaf...</h2>
      <p className="analyzing-subtitle">This may take a few seconds</p>

      {/* Step-by-Step Checklist */}
      <div className="step-checklist">
        {STEPS.map((step, idx) => {
          let statusClass = 'pending';
          let statusText = '';
          let IconComponent = Circle;

          if (idx < currentStepIdx) {
            statusClass = 'completed';
            statusText = 'Completed';
            IconComponent = CheckCircle2;
          } else if (idx === currentStepIdx) {
            statusClass = 'active';
            statusText = 'In progress...';
            IconComponent = Loader2;
          }

          return (
            <div key={step.id} className={`step-item ${statusClass}`}>
              <div className="step-icon">
                <IconComponent size={20} />
              </div>
              <div className="step-content">
                <span className="step-title">{step.title}</span>
                {statusText && <span className="step-status">{statusText}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
