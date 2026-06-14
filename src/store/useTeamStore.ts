import { create } from 'zustand';
import { TeamMember, ToolRequest, FlowSuggestion, Workflow } from '@/types';
import { teamMembers, toolRequests, flowSuggestions, workflows, teamStats } from '@/data/team';

interface TeamState {
  members: TeamMember[];
  toolRequests: ToolRequest[];
  flowSuggestions: FlowSuggestion[];
  workflows: Workflow[];
  stats: typeof teamStats;
  selectedTab: 'overview' | 'recommendations' | 'requests' | 'members' | 'suggestions';
  setSelectedTab: (tab: string) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  addToolRequest: (name: string, reason: string, applicantId: string, applicantName: string) => void;
  toggleWorkflowFavorite: (id: string) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  members: teamMembers,
  toolRequests,
  flowSuggestions,
  workflows,
  stats: teamStats,
  selectedTab: 'overview',
  setSelectedTab: (tab) => set({ selectedTab: tab as TeamState['selectedTab'] }),
  approveRequest: (id) =>
    set((state) => ({
      toolRequests: state.toolRequests.map((r) =>
        r.id === id ? { ...r, status: 'approved' as const } : r
      ),
    })),
  rejectRequest: (id) =>
    set((state) => ({
      toolRequests: state.toolRequests.map((r) =>
        r.id === id ? { ...r, status: 'rejected' as const } : r
      ),
    })),
  addToolRequest: (name, reason, applicantId, applicantName) => {
    const newRequest: ToolRequest = {
      id: Date.now().toString(),
      name,
      reason,
      applicantId,
      applicantName,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ toolRequests: [newRequest, ...state.toolRequests] }));
  },
  toggleWorkflowFavorite: (id) =>
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
      ),
    })),
}));
