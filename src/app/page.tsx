'use client';

import React, { useEffect, useState } from 'react';
import MangaList from '../components/MangaList';
import Recommendations from '../components/Recommendations';
import QRShare from '../components/QRShare';
import { useStore } from '../store/useStore';

export default function Home() {
  const { isLoaded, setTitles } = useStore();
  const [activeTab, setActiveTab] = useState<'status' | 'recommendations'>('status');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we need to hydrate titles
    fetch('/manga_title.txt')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load manga_title.txt');
        return res.text();
      })
      .then(text => {
        // Split by newline and remove empty lines
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        setTitles(lines);
      })
      .catch(err => {
        console.error(err);
        setError('漫画データの読み込みに失敗しました。');
      });
  }, [setTitles]);

  if (error) {
    return <div className="loading-error">{error}</div>;
  }

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>漫画データを読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>Manga Manager</h1>
      </header>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          ステータス
        </button>
        <button 
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          おすすめ
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'status' && <MangaList />}
        {activeTab === 'recommendations' && <Recommendations />}
      </div>

      <div className="bottom-area">
        <QRShare />
      </div>
    </main>
  );
}
