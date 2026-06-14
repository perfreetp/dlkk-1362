import { create } from 'zustand';
import { TeamMember, ToolRequest, FlowSuggestion, Workflow, WorkflowExecutionRecord } from '@/types';
import { teamMembers, toolRequests, flowSuggestions, workflows, teamStats } from '@/data/team';
import { loadFromStorage, saveToStorage } from '@/utils/persist';

const WORKFLOWS_KEY = 'workflows';
const EXECUTIONS_KEY = 'workflowExecutions';

interface TeamState {
  members: TeamMember[];
  toolRequests: ToolRequest[];
  flowSuggestions: FlowSuggestion[];
  workflows: Workflow[];
  workflowExecutions: WorkflowExecutionRecord[];
  stats: typeof teamStats;
  selectedTab: 'overview' | 'recommendations' | 'requests' | 'members' | 'suggestions';
  setSelectedTab: (tab: string) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  addToolRequest: (name: string, reason: string, applicantId: string, applicantName: string) => void;
  toggleWorkflowFavorite: (id: string) => void;
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'useCount' | 'isFavorite'>) => void;
  updateWorkflow: (id: string, data: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  incrementWorkflowUseCount: (id: string) => void;
  addWorkflowExecution: (execution: Omit<WorkflowExecutionRecord, 'id' | 'createdAt'>) => WorkflowExecutionRecord;
  updateWorkflowExecution: (id: string, data: Partial<WorkflowExecutionRecord>) => void;
  getWorkflowExecutions: (workflowId?: string) => WorkflowExecutionRecord[];
  deleteWorkflowExecution: (id: string) => void;
}

const persistedWorkflows = loadFromStorage<Workflow[] | null>(WORKFLOWS_KEY, null);
const persistedExecutions = loadFromStorage<WorkflowExecutionRecord[]>(EXECUTIONS_KEY, []);

export const useTeamStore = create<TeamState>((set, get) => ({
  members: teamMembers,
  toolRequests,
  flowSuggestions,
  workflows: persistedWorkflows || workflows,
  workflowExecutions: persistedExecutions,
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
  toggleWorkflowFavorite: (id) => {
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
      ),
    }));
    saveToStorage(WORKFLOWS_KEY, get().workflows);
  },
  addWorkflow: (workflow) => {
    const newWorkflow: Workflow = {
      ...workflow,
      id: Date.now().toString(),
      useCount: 0,
      isFavorite: false,
    };
    set((state) => ({ workflows: [...state.workflows, newWorkflow] }));
    saveToStorage(WORKFLOWS_KEY, get().workflows);
  },
  updateWorkflow: (id, data) => {
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, ...data } : w
      ),
    }));
    saveToStorage(WORKFLOWS_KEY, get().workflows);
  },
  deleteWorkflow: (id) => {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
    }));
    saveToStorage(WORKFLOWS_KEY, get().workflows);
  },
  incrementWorkflowUseCount: (id) => {
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, useCount: w.useCount + 1 } : w
      ),
    }));
    saveToStorage(WORKFLOWS_KEY, get().workflows);
  },
  addWorkflowExecution: (execution) => {
    const newExecution: WorkflowExecutionRecord = {
      ...execution,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-'),
    };
    set((state) => ({ workflowExecutions: [newExecution, ...state.workflowExecutions] }));
    saveToStorage(EXECUTIONS_KEY, get().workflowExecutions);
    return newExecution;
  },
  updateWorkflowExecution: (id, data) => {
    set((state) => ({
      workflowExecutions: state.workflowExecutions.map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
    }));
    saveToStorage(EXECUTIONS_KEY, get().workflowExecutions);
  },
  getWorkflowExecutions: (workflowId) => {
    const { workflowExecutions } = get();
    if (workflowId) {
      return workflowExecutions.filter((e) => e.workflowId === workflowId);
    }
    return workflowExecutions;
  },
  deleteWorkflowExecution: (id) => {
    set((state) => ({
      workflowExecutions: state.workflowExecutions.filter((e) => e.id !== id),
    }));
    saveToStorage(EXECUTIONS_KEY, get().workflowExecutions);
  },
}));
