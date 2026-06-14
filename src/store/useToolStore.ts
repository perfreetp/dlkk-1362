import { create } from 'zustand';
import { Tool } from '@/types';
import { tools as initialTools } from '@/data/tools';

interface ToolState {
  tools: Tool[];
  selectedCategory: string;
  selectedRole: string;
  searchQuery: string;
  selectedToolId: string | null;
  setSelectedCategory: (category: string) => void;
  setSelectedRole: (role: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTool: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  toggleTeamRecommend: (id: string) => void;
  getFilteredTools: () => Tool[];
  getFavoriteTools: () => Tool[];
}

export const useToolStore = create<ToolState>((set, get) => ({
  tools: initialTools,
  selectedCategory: 'all',
  selectedRole: 'all',
  searchQuery: '',
  selectedToolId: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTool: (id) => set({ selectedToolId: id }),
  toggleFavorite: (id) =>
    set((state) => ({
      tools: state.tools.map((t) =>
        t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
      ),
    })),
  toggleTeamRecommend: (id) =>
    set((state) => ({
      tools: state.tools.map((t) =>
        t.id === id ? { ...t, isTeamRecommended: !t.isTeamRecommended } : t
      ),
    })),
  getFilteredTools: () => {
    const { tools, selectedCategory, selectedRole, searchQuery } = get();
    return tools.filter((tool) => {
      const matchCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;
      const matchRole =
        selectedRole === 'all' || tool.suitableRoles.includes(selectedRole);
      const matchSearch =
        searchQuery === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchRole && matchSearch;
    });
  },
  getFavoriteTools: () => {
    return get().tools.filter((t) => t.isFavorite);
  },
}));
