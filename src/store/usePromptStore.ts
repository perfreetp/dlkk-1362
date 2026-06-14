import { create } from 'zustand';
import { Prompt } from '@/types';
import { prompts as initialPrompts } from '@/data/prompts';
import { loadFromStorage, saveToStorage } from '@/utils/persist';

const STORAGE_KEY = 'prompts';

interface PromptState {
  prompts: Prompt[];
  selectedCategory: string;
  searchQuery: string;
  selectedPromptId: string | null;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedPromptId: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  toggleTeamShare: (id: string) => void;
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>) => void;
  updatePrompt: (id: string, data: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  getFilteredPrompts: () => Prompt[];
  incrementUseCount: (id: string) => void;
}

const persistedPrompts = loadFromStorage<Prompt[] | null>(STORAGE_KEY, null);

export const usePromptStore = create<PromptState>((set, get) => ({
  prompts: persistedPrompts || initialPrompts,
  selectedCategory: 'all',
  searchQuery: '',
  selectedPromptId: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedPromptId: (id) => set({ selectedPromptId: id }),
  toggleFavorite: (id) => {
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      ),
    }));
    saveToStorage(STORAGE_KEY, get().prompts);
  },
  toggleTeamShare: (id) => {
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, isTeamShared: !p.isTeamShared } : p
      ),
    }));
    saveToStorage(STORAGE_KEY, get().prompts);
  },
  addPrompt: (prompt) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: Date.now().toString(),
      useCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ prompts: [newPrompt, ...state.prompts] }));
    saveToStorage(STORAGE_KEY, get().prompts);
  },
  updatePrompt: (id, data) => {
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString().split('T')[0] } : p
      ),
    }));
    saveToStorage(STORAGE_KEY, get().prompts);
  },
  deletePrompt: (id) => {
    const { selectedPromptId } = get();
    set((state) => ({
      prompts: state.prompts.filter((p) => p.id !== id),
      selectedPromptId: selectedPromptId === id ? null : selectedPromptId,
    }));
    saveToStorage(STORAGE_KEY, get().prompts);
  },
  getFilteredPrompts: () => {
    const { prompts, selectedCategory, searchQuery } = get();
    return prompts.filter((prompt) => {
      let matchCategory = true;
      if (selectedCategory === 'favorite') {
        matchCategory = prompt.isFavorite;
      } else if (selectedCategory === 'team') {
        matchCategory = prompt.isTeamShared;
      } else if (selectedCategory !== 'all') {
        matchCategory = prompt.category === selectedCategory;
      }
      const matchSearch =
        searchQuery === '' ||
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  },
  incrementUseCount: (id) => {
    set((state) => ({
      prompts: state.prompts.map((p) =>
        p.id === id ? { ...p, useCount: p.useCount + 1 } : p
      ),
    }));
    saveToStorage(STORAGE_KEY, get().prompts);
  },
}));
