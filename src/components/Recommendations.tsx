import React, { useState, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useStore } from '../store/useStore';

export default function Recommendations() {
  const { titles, recommendations, toggleRecommendation, statuses } = useStore();
  const [search, setSearch] = useState('');
  
  const parentRef = useRef<HTMLDivElement>(null);

  // Show only titles that match the search.
  // To encourage recommending read mangas, we can sort or just show all.
  const filteredItems = useMemo(() => {
    if (!search) return titles.map((title, index) => ({ title, index }));
    return titles
      .map((title, index) => ({ title, index }))
      .filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
  }, [titles, search]);

  const rowVirtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 5,
  });

  return (
    <div className="recommendations-container">
      <div className="selected-recs">
        <h3>おすすめ ({recommendations.length} / 5)</h3>
        {recommendations.length === 0 ? (
          <p className="empty-msg">おすすめが選択されていません。下のリストから追加してください。</p>
        ) : (
          <ul className="rec-list">
            {recommendations.map(id => (
              <li key={id} className="rec-item">
                <span>{titles[id]}</span>
                <button className="remove-btn" onClick={() => toggleRecommendation(id)}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="おすすめに追加するタイトルを検索..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="search-input"
        />
      </div>
      
      <div 
        ref={parentRef} 
        className="virtual-scroll-container rec-virtual-container"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = filteredItems[virtualItem.index];
            const isSelected = recommendations.includes(item.index);
            const isFull = recommendations.length >= 5;

            return (
              <div
                key={virtualItem.key}
                className="virtual-row"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div 
                  className={`manga-item ${isSelected ? 'selected-rec' : ''} ${!isSelected && isFull ? 'disabled' : ''}`}
                  onClick={() => {
                    if (!isSelected && isFull) {
                      alert('おすすめは最大5冊までです');
                      return;
                    }
                    toggleRecommendation(item.index);
                  }}
                >
                  <span className="manga-title">{item.title}</span>
                  <span className="manga-status-badge">
                    {isSelected ? '選択済み' : '追加'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
