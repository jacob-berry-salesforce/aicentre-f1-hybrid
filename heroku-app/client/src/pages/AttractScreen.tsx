import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import './AttractScreen.css';

function AttractScreen() {
  const [searchParams] = useSearchParams();
  const rig = searchParams.get('rig') || '1';
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    // Generate QR code URL
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/register?rig=${rig}`;
    setQrUrl(url);
  }, [rig]);

  return (
    <div className="attract-screen fullscreen">
      {/* Animated background clouds */}
      <div className="background-clouds">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      {/* Main content */}
      <div className="attract-content animate-slide-in">
        {/* Header with gradient background */}
        <div className="attract-header">
          <div className="logo-container">
            <div className="logo-circle">
              <span className="logo-emoji">🏎️</span>
            </div>
          </div>
          <h1 className="attract-title">F1 Racing Simulator</h1>
          <div className="rig-badge">
            <span className="rig-label">Rig</span>
            <span className="rig-number">{rig}</span>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="qr-card">
          <div className="qr-card-header">
            <div className="star-icon">⭐</div>
            <h2 className="qr-card-title">Ready to Race?</h2>
          </div>
          <div className="qr-container">
            {qrUrl && (
              <QRCodeSVG
                value={qrUrl}
                size={280}
                bgColor="#FFFFFF"
                fgColor="#032D60"
                level="H"
                className="qr-code"
              />
            )}
          </div>
          <div className="qr-card-footer">
            <div className="scan-instruction">
              <div className="phone-icon">📱</div>
              <p className="scan-text">Scan with your phone to register</p>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="attract-cta">
          <div className="cta-steps">
            <div className="step-item">
              <div className="step-number">1</div>
              <p className="step-text">Scan QR Code</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-number">2</div>
              <p className="step-text">Register</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-number">3</div>
              <p className="step-text">Race!</p>
            </div>
          </div>
        </div>

        {/* Footer character */}
        <div className="attract-footer">
          <div className="character-container">
            <div className="character-emoji">🚀</div>
            <p className="footer-text">Powered by Vibe Coding AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttractScreen;
