import { create } from 'zustand';
import { TaskRecord } from '@/types';
import { taskRecords as initialRecords } from '@/data/tasks';

interface TaskState {
  records: TaskRecord[];
  filterTool: string;
  filterRating: number;
  showFavoritesOnly: boolean;
  selectedRecordId: string | null;
  setFilterTool: (toolId: string) => void;
  setFilterRating: (rating: number) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  setSelectedRecordId: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  setRating: (id: string, rating: number) => void;
  setComment: (id: string, comment: string) => void;
  addRecord: (record: Omit<TaskRecord, 'id' | 'createdAt'>) => TaskRecord;
  getFilteredRecords: () => TaskRecord[];
  getFavoriteRecords: () => TaskRecord[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  records: initialRecords,
  filterTool: 'all',
  filterRating: 0,
  showFavoritesOnly: false,
  selectedRecordId: null,
  setFilterTool: (toolId) => set({ filterTool: toolId }),
  setFilterRating: (rating) => set({ filterRating: rating }),
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),
  setSelectedRecordId: (id) => set({ selectedRecordId: id }),
  toggleFavorite: (id) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
      ),
    })),
  setRating: (id, rating) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, rating } : r
      ),
    })),
  setComment: (id, comment) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id ? { ...r, comment } : r
      ),
    })),
  addRecord: (record) => {
    const newRecord: TaskRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(/\//g, '-'),
    };
    set((state) => ({ records: [newRecord, ...state.records] }));
    return newRecord;
  },
  getFilteredRecords: () => {
    const { records, filterTool, filterRating, showFavoritesOnly } = get();
    return records.filter((record) => {
      const matchTool = filterTool === 'all' || record.toolId === filterTool;
      const matchRating = filterRating === 0 || record.rating >= filterRating;
      const matchFavorite = !showFavoritesOnly || record.isFavorite;
      return matchTool && matchRating && matchFavorite;
    });
  },
  getFavoriteRecords: () => {
    return get().records.filter((r) => r.isFavorite);
  },
}));
