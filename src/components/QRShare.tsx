import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import jsQR from 'jsqr';
import { useStore } from '../store/useStore';
import { encodeState, decodeState } from '../utils/binaryEncoding';

export default function QRShare() {
  const { titles, statuses, recommendations, loadState } = useStore();
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    const data = encodeState(statuses, recommendations, titles.length);
    setQrData(data);
    setShowQR(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          alert('Canvas not supported');
          return;
        }
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          try {
            const { statuses: newStatuses, recommendations: newRecs } = decodeState(code.data, titles.length);
            loadState(newStatuses, newRecs);
            alert('状態を復元しました！');
          } catch (error) {
            console.error(error);
            alert('QRコードの解析に失敗しました。対応していないフォーマットです。');
          }
        } else {
          alert('QRコードが見つかりませんでした。別の画像をお試しください。');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="qr-share-container">
      <div className="qr-actions">
        <button className="btn primary-btn" onClick={handleGenerate}>
          現在の状態を共有するQRコードを生成
        </button>
        
        <label className="btn secondary-btn">
          QRコード画像を読み込む
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {showQR && (
        <div className="qr-modal-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
            <h3>共有用QRコード</h3>
            <p>このQRコードを保存して、他の端末で読み込んでください。</p>
            <div className="qr-code-wrapper">
              <QRCodeCanvas value={qrData} size={256} level="L" />
            </div>
            <button className="btn close-btn" onClick={() => setShowQR(false)}>閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}
