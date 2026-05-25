import React, { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useStore } from '../store/useStore';

export default function MangaList() {
  const { titles, statuses, toggleStatus, isLoaded } = useStore();
  const [search, setSearch] = useState('');
  
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    if (!search) return titles.map((title, index) => ({ title, index }));
    return titles
      .map((title, index) => ({ title, index }))
      .filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
  }, [titles, search]);

  const rowVirtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // row height
    overscan: 5,
  });

  if (!isLoaded) return <div className="loading">Loading...</div>;

  return (
    <div className="manga-list-container">
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="タイトルを検索..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="search-input"
        />
      </div>
      
      <div 
        ref={parentRef} 
        className="virtual-scroll-container"
        style={{
          height: 'calc(100vh - 200px)',
          overflow: 'auto',
        }}
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
            const status = statuses[item.index];
            let statusClass = 'status-unread';
            let statusText = '未読';
            if (status === 1) {
              statusClass = 'status-reading';
              statusText = '読み途中';
            } else if (status === 2) {
              statusClass = 'status-read';
              statusText = '読了';
            }

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
                  className={`manga-item ${statusClass}`}
                  onClick={() => toggleStatus(item.index)}
                >
                  <span className="manga-title">{item.title}</span>
                  <span className="manga-status-badge">{statusText}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
