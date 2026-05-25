import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MangaStore {
  titles: string[];
  statuses: number[]; // 0: unread, 1: reading, 2: read
  recommendations: number[]; // Array of IDs
  isLoaded: boolean;
  setTitles: (titles: string[]) => void;
  toggleStatus: (id: number) => void;
  toggleRecommendation: (id: number) => void;
  loadState: (statuses: number[], recommendations: number[]) => void;
  resetState: () => void;
}

export const useStore = create<MangaStore>()(
  persist(
    (set, get) => ({
      titles: [],
      statuses: [],
      recommendations: [],
      isLoaded: false,

      setTitles: (titles) => {
        set((state) => {
          // If this is the first load, initialize statuses array
          if (state.statuses.length === 0 || state.statuses.length !== titles.length) {
            return {
              titles,
              statuses: new Array(titles.length).fill(0),
              isLoaded: true
            };
          }
          return { titles, isLoaded: true };
        });
      },

      toggleStatus: (id) => {
        set((state) => {
          const newStatuses = [...state.statuses];
          newStatuses[id] = (newStatuses[id] + 1) % 3;
          return { statuses: newStatuses };
        });
      },

      toggleRecommendation: (id) => {
        set((state) => {
          const recs = [...state.recommendations];
          const idx = recs.indexOf(id);
          if (idx !== -1) {
            recs.splice(idx, 1);
            return { recommendations: recs };
          } else {
            if (recs.length < 5) {
              recs.push(id);
              return { recommendations: recs };
            }
          }
          return state;
        });
      },

      loadState: (statuses, recommendations) => {
        set({ statuses, recommendations });
      },

      resetState: () => {
        set((state) => ({
          statuses: new Array(state.titles.length).fill(0),
          recommendations: []
        }));
      }
    }),
    {
      name: 'manga-storage',
      partialize: (state) => ({ statuses: state.statuses, recommendations: state.recommendations }),
    }
  )
);
