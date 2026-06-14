export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  quota: {
    total: number;
    used: number;
    unit: string;
  };
  expiryDate: string;
  rating: number;
  useCount: number;
  isFavorite: boolean;
  isTeamRecommended: boolean;
  suitableRoles: string[];
  gradientFrom: string;
  gradientTo: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  variables: string[];
  category: string;
  tags: string[];
  isFavorite: boolean;
  isTeamShared: boolean;
  useCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRecord {
  id: string;
  toolId: string;
  toolName: string;
  toolIcon: string;
  promptId?: string;
  promptTitle?: string;
  input: string;
  output: string;
  rating: number;
  isFavorite: boolean;
  comment?: string;
  duration: number;
  quotaUsed: number;
  createdAt: string;
  createdBy: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    toolId?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isFavorite: boolean;
  useCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: 'member' | 'admin';
  position: string;
  joinDate: string;
  taskCount: number;
}

export interface ToolRequest {
  id: string;
  name: string;
  reason: string;
  applicantId: string;
  applicantName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface FlowSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'duplicate' | 'inefficient' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  relatedTools: string[];
  suggestion: string;
}

export interface PromptCategory {
  id: string;
  name: string;
  count: number;
  icon: string;
}

export type TabType = 'tools' | 'workbench' | 'prompts' | 'tasks' | 'team';
