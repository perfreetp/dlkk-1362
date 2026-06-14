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
  addWorkflow: (workflow: Omit<Workflow, 'id' | 'useCount' | 'isFavorite' | 'createdAt' | 'updatedAt'>) => Workflow;
  updateWorkflow: (id: string, data: Partial<Workflow>) => void;
  deleteWorkflow: (id: string, keepExecutions?: boolean) => void;
  incrementWorkflowUseCount: (id: string) => void;
  addWorkflowExecution: (execution: Omit<WorkflowExecutionRecord, 'id' | 'createdAt'>) => WorkflowExecutionRecord;
  updateWorkflowExecution: (id: string, data: Partial<WorkflowExecutionRecord>) => void;
  getWorkflowExecutions: (workflowId?: string) => WorkflowExecutionRecord[];
  deleteWorkflowExecution: (id: string) => void;
  pauseExecution: (id: string) => void;
  resumeExecution: (id: string) => void;
  saveVariableValues: (executionId: string, variableValues: Record<string, string>, stepVariableValues?: Record<string, Record<string, string>>) => void;
  saveStepToTasks: (executionId: string, stepIndex: number, taskId: string) => void;
  markOrphanExecutions: (workflowId: string) => void;
  reExecuteFromRecord: (executionId: string) => WorkflowExecutionRecord | null;
  saveAsNewWorkflow: (executionId: string, newName: string, newDescription?: string) => Workflow | null;
}

const persistedWorkflows = loadFromStorage<Workflow[] | null>(WORKFLOWS_KEY, null);
const persistedExecutions = loadFromStorage<WorkflowExecutionRecord[]>(EXECUTIONS_KEY, []);

const formatTime = () =>
  new Date()
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .replace(/\//g, '-');

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
    const now = new Date()
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(/\//g, '-');
    const newWorkflow: Workflow = {
      ...workflow,
      id: Date.now().toString(),
      useCount: 0,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ workflows: [...state.workflows, newWorkflow] }));
    saveToStorage(WORKFLOWS_KEY, get().workflows);
    return newWorkflow;
  },
  updateWorkflow: (id, data) => {
    const now = new Date()
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(/\//g, '-');
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id ? { ...w, ...data, updatedAt: now } : w
      ),
    }));
    saveToStorage(WORKFLOWS_KEY, get().workflows);
  },
  deleteWorkflow: (id, keepExecutions = true) => {
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
    }));
    saveToStorage(WORKFLOWS_KEY, get().workflows);
    if (keepExecutions) {
      get().markOrphanExecutions(id);
    } else {
      set((state) => ({
        workflowExecutions: state.workflowExecutions.filter((e) => e.workflowId !== id),
      }));
      saveToStorage(EXECUTIONS_KEY, get().workflowExecutions);
    }
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
    const { workflows } = get();
    const workflow = workflows.find((w) => w.id === execution.workflowId);
    const newExecution: WorkflowExecutionRecord = {
      ...execution,
      id: Date.now().toString(),
      createdAt: formatTime(),
      isOrphan: !workflow,
      savedToTasks: [],
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
  pauseExecution: (id) => {
    set((state) => ({
      workflowExecutions: state.workflowExecutions.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'paused' as const,
              pausedAt: formatTime(),
              steps: e.steps.map((s) =>
                s.status === 'running' ? { ...s, status: 'paused' as const } : s
              ),
            }
          : e
      ),
    }));
    saveToStorage(EXECUTIONS_KEY, get().workflowExecutions);
  },
  resumeExecution: (id) => {
    set((state) => ({
      workflowExecutions: state.workflowExecutions.map((e) =>
        e.id === id
          ? {
              ...e,
              status: 'running' as const,
              resumedAt: formatTime(),
            }
          : e
      ),
    }));
    saveToStorage(EXECUTIONS_KEY, get().workflowExecutions);
  },
  saveVariableValues: (executionId, variableValues, stepVariableValues) => {
    const updateData: Partial<WorkflowExecutionRecord> = { variableValues };
    if (stepVariableValues) {
      updateData.stepVariableValues = stepVariableValues;
    }
    get().updateWorkflowExecution(executionId, updateData);
  },
  saveStepToTasks: (executionId, stepIndex, taskId) => {
    set((state) => ({
      workflowExecutions: state.workflowExecutions.map((e) => {
        if (e.id !== executionId) return e;
        const savedToTasks = e.savedToTasks || [];
        if (!savedToTasks.includes(taskId)) {
          return { ...e, savedToTasks: [...savedToTasks, taskId] };
        }
        return e;
      }),
    }));
    saveToStorage(EXECUTIONS_KEY, get().workflowExecutions);
  },
  markOrphanExecutions: (workflowId) => {
    set((state) => ({
      workflowExecutions: state.workflowExecutions.map((e) =>
        e.workflowId === workflowId ? { ...e, isOrphan: true } : e
      ),
    }));
    saveToStorage(EXECUTIONS_KEY, get().workflowExecutions);
  },
  reExecuteFromRecord: (executionId) => {
    const { workflowExecutions, workflows, addWorkflowExecution } = get();
    const record = workflowExecutions.find((e) => e.id === executionId);
    if (!record) return null;

    const workflow = workflows.find((w) => w.id === record.workflowId);
    if (!workflow) return null;

    const newExecution = addWorkflowExecution({
      workflowId: record.workflowId,
      workflowName: record.workflowName,
      initialInput: record.initialInput,
      steps: record.steps.map((s) => ({
        ...s,
        status: 'pending' as const,
        input: '',
        output: '',
        startTime: undefined,
        endTime: undefined,
        duration: undefined,
      })),
      finalOutput: '',
      status: 'pending' as const,
      variableValues: record.variableValues,
      stepVariableValues: record.stepVariableValues,
    });
    return newExecution;
  },
  saveAsNewWorkflow: (executionId, newName, newDescription) => {
    const { workflowExecutions, workflows, addWorkflow } = get();
    const record = workflowExecutions.find((e) => e.id === executionId);
    if (!record) return null;

    const originalWorkflow = workflows.find((w) => w.id === record.workflowId);
    if (!originalWorkflow) return null;

    const newWorkflow = addWorkflow({
      name: newName,
      description: newDescription || originalWorkflow.description,
      nodes: originalWorkflow.nodes.map((n) => ({ ...n, id: `${n.id}-${Date.now()}` })),
      edges: originalWorkflow.edges.map((e) => ({
        ...e,
        id: `${e.id}-${Date.now()}`,
        source: `${e.source}-${Date.now()}`,
        target: `${e.target}-${Date.now()}`,
      })),
    });
    return newWorkflow;
  },
}));
