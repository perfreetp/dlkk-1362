import { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Wrench,
  Copy,
  Sparkles,
  ArrowRight,
  GitBranch,
  Link2,
  Layers,
  Save,
  RefreshCw,
  FolderPlus,
  Archive,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import {
  Workflow,
  WorkflowExecutionRecord,
  WorkflowExecutionStep,
  StepVariableFormItem,
  WorkflowNode,
} from '@/types';
import { tools } from '@/data/tools';
import { useTeamStore } from '@/store/useTeamStore';
import { usePromptStore } from '@/store/usePromptStore';
import { useTaskStore } from '@/store/useTaskStore';
import { getIconByName } from '@/utils/iconHelper';

interface WorkflowExecutorProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow;
  existingExecution?: WorkflowExecutionRecord | null;
}

interface StepResult {
  expanded: boolean;
}

const PLATFORM_OPTIONS = [
  { label: '微信公众号', value: 'wechat' },
  { label: '小红书', value: 'xiaohongshu' },
  { label: '抖音', value: 'douyin' },
  { label: '知乎', value: 'zhihu' },
  { label: '微博', value: 'weibo' },
  { label: 'B站', value: 'bilibili' },
  { label: '通用', value: 'general' },
];

const AUDIENCE_OPTIONS = [
  { label: '职场人士', value: 'professional' },
  { label: '学生群体', value: 'student' },
  { label: '宝妈群体', value: 'mother' },
  { label: '科技爱好者', value: 'tech_lover' },
  { label: '文艺青年', value: 'artistic' },
  { label: '企业决策者', value: 'executive' },
  { label: '普通读者', value: 'general' },
];

const LANGUAGE_OPTIONS = [
  { label: '中文', value: 'zh' },
  { label: '英文', value: 'en' },
  { label: '日文', value: 'ja' },
  { label: '韩文', value: 'ko' },
  { label: '法文', value: 'fr' },
  { label: '德文', value: 'de' },
];

const LENGTH_OPTIONS = [
  { label: '短篇 (< 500字)', value: 'short' },
  { label: '中篇 (500-1500字)', value: 'medium' },
  { label: '长篇 (1500-3000字)', value: 'long' },
  { label: '超长篇 (> 3000字)', value: 'xl' },
];

const TONE_OPTIONS = [
  { label: '正式专业', value: 'formal' },
  { label: '轻松活泼', value: 'casual' },
  { label: '幽默风趣', value: 'humorous' },
  { label: '温暖治愈', value: 'warm' },
  { label: '客观中立', value: 'neutral' },
  { label: '激情澎湃', value: 'passionate' },
];

const VARIABLE_PRESETS: Record<string, StepVariableFormItem> = {
  platform: {
    name: 'platform',
    label: '发布平台',
    type: 'select',
    required: true,
    options: PLATFORM_OPTIONS,
    nodeId: '',
    stepIndex: -1,
  },
  audience: {
    name: 'audience',
    label: '目标受众',
    type: 'select',
    required: true,
    options: AUDIENCE_OPTIONS,
    nodeId: '',
    stepIndex: -1,
  },
  language: {
    name: 'language',
    label: '语言',
    type: 'select',
    required: true,
    options: LANGUAGE_OPTIONS,
    nodeId: '',
    stepIndex: -1,
  },
  length: {
    name: 'length',
    label: '篇幅',
    type: 'select',
    required: true,
    options: LENGTH_OPTIONS,
    nodeId: '',
    stepIndex: -1,
  },
  tone: {
    name: 'tone',
    label: '语气风格',
    type: 'select',
    required: false,
    options: TONE_OPTIONS,
    nodeId: '',
    stepIndex: -1,
  },
  topic: {
    name: 'topic',
    label: '文章主题',
    type: 'text',
    required: true,
    placeholder: '如：人工智能的未来发展',
    nodeId: '',
    stepIndex: -1,
  },
  product: {
    name: 'product',
    label: '产品名称',
    type: 'text',
    required: true,
    placeholder: '如：某品牌智能手表',
    nodeId: '',
    stepIndex: -1,
  },
};

function buildDAG(nodes: WorkflowNode[]) {
  const toolNodes = nodes.filter((n) => n.type === 'tool');
  const nodeMap = new Map(toolNodes.map((n) => [n.id, n]));
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};

  toolNodes.forEach((n) => {
    inDegree[n.id] = n.data.dependsOn?.length || 0;
    adjList[n.id] = [];
  });

  toolNodes.forEach((n) => {
    n.data.dependsOn?.forEach((depId) => {
      if (adjList[depId]) adjList[depId].push(n.id);
    });
  });

  return { toolNodes, nodeMap, inDegree, adjList };
}

function topologicalSortExecution(nodes: WorkflowNode[]): string[][] {
  const { toolNodes, inDegree, adjList } = buildDAG(nodes);
  const result: string[][] = [];
  const remainingInDegree = { ...inDegree };
  const executed = new Set<string>();

  while (executed.size < toolNodes.length) {
    const currentReady: string[] = [];

    Object.keys(remainingInDegree).forEach((nodeId) => {
      if (!executed.has(nodeId) && remainingInDegree[nodeId] === 0) {
        currentReady.push(nodeId);
      }
    });

    if (currentReady.length === 0) {
      const remaining = toolNodes.filter((n) => !executed.has(n.id));
      remaining.forEach((n) => currentReady.push(n.id));
      if (currentReady.length === 0) break;
    }

    const byGroup: Record<string, string[]> = {};
    currentReady.forEach((id) => {
      const node = toolNodes.find((n) => n.id === id);
      const group = node?.data.branchGroup || 'default';
      if (!byGroup[group]) byGroup[group] = [];
      byGroup[group].push(id);
    });

    const parallelBatches: string[][] = [];
    Object.values(byGroup).forEach((groupNodes) => {
      if (groupNodes.length > 1) {
        parallelBatches.push(groupNodes);
      } else {
        parallelBatches.push([groupNodes[0]]);
      }
    });

    parallelBatches.forEach((batch) => {
      result.push(batch);
      batch.forEach((id) => {
        executed.add(id);
        adjList[id]?.forEach((nextId) => {
          remainingInDegree[nextId]--;
        });
      });
    });
  }

  return result;
}

export function WorkflowExecutor({
  isOpen,
  onClose,
  workflow,
  existingExecution,
}: WorkflowExecutorProps) {
  const {
    addWorkflowExecution,
    updateWorkflowExecution,
    incrementWorkflowUseCount,
    pauseExecution,
    resumeExecution,
    saveVariableValues,
    saveStepToTasks,
    reExecuteFromRecord,
    saveAsNewWorkflow,
  } = useTeamStore();
  const { prompts, incrementUseCount } = usePromptStore();
  const { addRecord } = useTaskStore();

  const [phase, setPhase] = useState<'form' | 'running' | 'finished'>('form');
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [executionRecord, setExecutionRecord] = useState<WorkflowExecutionRecord | null>(
    existingExecution || null
  );
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [finalExpanded, setFinalExpanded] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [stepVariableValues, setStepVariableValues] = useState<Record<string, Record<string, string>>>({});
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [saveAsDesc, setSaveAsDesc] = useState('');

  const isReplay = !!existingExecution;

  const startAtRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const abortRef = useRef(false);

  const toolNodes = useMemo(() => workflow.nodes.filter((n) => n.type === 'tool'), [workflow]);

  const executionPlan = useMemo(() => topologicalSortExecution(workflow.nodes), [workflow]);

  const variableFormItems = useMemo<StepVariableFormItem[]>(() => {
    const items: StepVariableFormItem[] = [];
    toolNodes.forEach((node, stepIndex) => {
      const prompt = prompts.find((p) => p.id === node.data.promptId);
      if (prompt && prompt.variables.length > 0) {
        prompt.variables.forEach((v) => {
          const preset = VARIABLE_PRESETS[v.toLowerCase()];
          if (preset) {
            items.push({
              ...preset,
              nodeId: node.id,
              stepIndex,
            });
          } else {
            items.push({
              name: v,
              label: v,
              type: 'text',
              required: true,
              placeholder: `请输入${v}`,
              nodeId: node.id,
              stepIndex,
            });
          }
        });
      }
    });
    return items;
  }, [toolNodes, prompts]);

  const groupedFormItems = useMemo(() => {
    const groups: Record<number, StepVariableFormItem[]> = {};
    variableFormItems.forEach((item) => {
      if (!groups[item.stepIndex]) groups[item.stepIndex] = [];
      groups[item.stepIndex].push(item);
    });
    return groups;
  }, [variableFormItems]);

  useEffect(() => {
    if (!isOpen) return;

    if (existingExecution) {
      setExecutionRecord(existingExecution);
      setInput(existingExecution.initialInput);
      setVariableValues(existingExecution.variableValues || {});
      setStepVariableValues(existingExecution.stepVariableValues || {});
      setStepResults(existingExecution.steps.map(() => ({ expanded: false })));
      setFinalExpanded(false);
      setPhase(
        existingExecution.status === 'paused' || existingExecution.status === 'running'
          ? 'running'
          : 'finished'
      );
      setIsRunning(existingExecution.status === 'running');
      setIsPaused(existingExecution.status === 'paused');
    } else {
      setExecutionRecord(null);
      setInput('');
      setVariableValues({});
      setStepVariableValues({});
      setStepResults(toolNodes.map(() => ({ expanded: false })));
      setFinalExpanded(false);
      setPhase('form');
      setIsRunning(false);
      setIsPaused(false);
      accumulatedTimeRef.current = 0;
    }
  }, [isOpen, workflow.id, existingExecution, toolNodes.length]);

  if (!isOpen) return null;

  const getToolInfo = (toolId: string) => tools.find((t) => t.id === toolId);
  const getPromptInfo = (promptId?: string) => (promptId ? prompts.find((p) => p.id === promptId) : null);

  const evaluateCondition = (
    inputText: string,
    operator: string,
    value: string
  ): boolean => {
    switch (operator) {
      case 'contains':
        return inputText.includes(value);
      case 'equals':
        return inputText === value;
      case 'startsWith':
        return inputText.startsWith(value);
      case 'lengthGt':
        return inputText.length > parseInt(value, 10);
      default:
        return true;
    }
  };

  const mockExecuteStep = async (
    stepInput: string,
    toolId: string,
    promptId?: string,
    stepVariableValues?: Record<string, string>
  ): Promise<string> => {
    const tool = getToolInfo(toolId);
    const prompt = getPromptInfo(promptId);
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));

    let baseOutput = '';
    if (prompt) {
      const vars = prompt.variables;
      let resolvedPrompt = prompt.content;
      vars.forEach((v, i) => {
        const replacement =
          stepVariableValues?.[v] || stepInput.slice(0, 20 + i * 5) || `[${v}]`;
        const regex = new RegExp(`\\{${v}\\}`, 'g');
        resolvedPrompt = resolvedPrompt.replace(regex, replacement);
      });
      baseOutput = `【${prompt.title} · ${tool?.name || 'AI处理'}】\n\n基于模板生成结果：\n\n${resolvedPrompt}\n\n---\n处理结果摘要：\n${stepInput.substring(0, 150)}${stepInput.length > 150 ? '...' : ''}\n\n已应用AI优化处理，语言流畅度提升40%，逻辑完整性提升35%。`;
    } else {
      baseOutput = `【${tool?.name || 'AI处理'}】\n\n对以下内容进行了智能处理：\n\n${stepInput.substring(0, 200)}${stepInput.length > 200 ? '\n...(内容已省略)...\n' : ''}\n\n---\n处理完成，共优化 ${Math.ceil(stepInput.length / 100)} 处，提升可读性 ${20 + Math.floor(Math.random() * 30)}%。`;
    }

    if (tool?.category === 'translate') {
      baseOutput += '\n\n翻译结果已进行母语级润色，确保地道自然表达。';
    } else if (tool?.category === 'image') {
      baseOutput += '\n\n图像生成参数已优化，输出风格符合当前设计趋势。';
    } else if (tool?.category === 'writing') {
      baseOutput += '\n\n内容结构已优化，可直接用于发布场景。';
    }

    return baseOutput;
  };

  const buildInitialSteps = (): WorkflowExecutionStep[] => {
    const nodeToIndex = new Map(toolNodes.map((n, i) => [n.id, i]));
    return toolNodes.map((node, index) => ({
      stepIndex: index,
      nodeId: node.id,
      toolId: node.data.toolId || '',
      toolName: getToolInfo(node.data.toolId || '')?.name || '未知工具',
      promptId: node.data.promptId,
      promptTitle: node.data.promptTitle,
      input: '',
      output: '',
      status: 'pending' as const,
      variableValues: stepVariableValues[node.id] || {},
    }));
  };

  const isFormValid = useMemo(() => {
    if (!input.trim()) return false;
    const requiredVars = variableFormItems.filter((v) => v.required);
    return requiredVars.every((v) => {
      const val = stepVariableValues[v.nodeId]?.[v.name] || variableValues[v.name];
      return val && val.trim().length > 0;
    });
  }, [input, variableFormItems, stepVariableValues, variableValues]);

  const handleRun = async () => {
    if (isPaused && existingExecution) {
      resumeExecution(existingExecution.id);
      setIsPaused(false);
      setIsRunning(true);
      if (pausedAtRef.current && startAtRef.current) {
        accumulatedTimeRef.current += Date.now() - pausedAtRef.current;
      }
      pausedAtRef.current = null;
      return;
    }

    if (!input.trim() || isRunning) return;

    incrementWorkflowUseCount(workflow.id);
    startAtRef.current = Date.now();
    accumulatedTimeRef.current = 0;

    const startTime = new Date()
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/\//g, '-');

    const initialSteps = buildInitialSteps();

    const newRecord = addWorkflowExecution({
      workflowId: workflow.id,
      workflowName: workflow.name,
      initialInput: input,
      steps: initialSteps,
      finalOutput: '',
      status: 'running' as const,
      startedAt: startTime,
      variableValues,
      stepVariableValues,
    });

    setExecutionRecord(newRecord);
    setPhase('running');
    setIsRunning(true);
    abortRef.current = false;

    const currentSteps = [...initialSteps];
    const stepIndexMap = new Map(toolNodes.map((n, i) => [n.id, i]));
    const nodeOutputCache: Record<string, string> = {};

    for (let batchIdx = 0; batchIdx < executionPlan.length; batchIdx++) {
      if (abortRef.current) break;

      const batch = executionPlan[batchIdx];
      const isParallel = batch.length > 1;

      const batchPromises = batch.map(async (nodeId) => {
        if (abortRef.current) return '';

        const stepIndex = stepIndexMap.get(nodeId)!;
        const node = toolNodes.find((n) => n.id === nodeId);
        if (!node) return '';

        currentSteps[stepIndex] = {
          ...currentSteps[stepIndex],
          status: 'running',
          startTime: Date.now(),
        };
        setExecutionRecord({ ...newRecord, steps: [...currentSteps] });

        const stepVars = stepVariableValues[nodeId] || {};
        const promptId = node.data.promptId;

        const deps = node.data.dependsOn || [];
        let stepInput = input;

        if (deps.length > 0) {
          const depOutputs = deps
            .map((depId) => nodeOutputCache[depId])
            .filter(Boolean);
          if (depOutputs.length > 0) {
            stepInput = depOutputs.join('\n\n---\n\n');
          }
        }

        if (node.data.condition) {
          const conditionMet = evaluateCondition(
            stepInput,
            node.data.condition.operator,
            node.data.condition.value
          );
          if (!conditionMet) {
            currentSteps[stepIndex] = {
              ...currentSteps[stepIndex],
              status: 'skipped',
              input: stepInput,
              output: '条件不满足，跳过此步骤',
              skippedReason: `条件 ${node.data.condition.operator} "${node.data.condition.value}" 不满足`,
              endTime: Date.now(),
            };
            updateWorkflowExecution(newRecord.id, { steps: [...currentSteps] });
            nodeOutputCache[nodeId] = stepInput;
            return stepInput;
          }
        }

        if (promptId) {
          incrementUseCount(promptId);
        }

        const output = await mockExecuteStep(stepInput, node.data.toolId || '', promptId, stepVars);

        const duration = Date.now() - (currentSteps[stepIndex].startTime || Date.now());
        currentSteps[stepIndex] = {
          ...currentSteps[stepIndex],
          status: 'completed',
          input: stepInput,
          output,
          endTime: Date.now(),
          duration,
        };

        updateWorkflowExecution(newRecord.id, { steps: [...currentSteps] });
        nodeOutputCache[nodeId] = output;

        return output;
      });

      await Promise.all(batchPromises);

      if (abortRef.current) break;
    }

    const totalDuration =
      accumulatedTimeRef.current +
      (startAtRef.current ? Date.now() - startAtRef.current : 0);

    const completedAt = new Date()
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/\//g, '-');

    const finalOutput = currentSteps
      .filter((s) => s.status === 'completed')
      .map((s) => s.output)
      .join('\n\n==========\n\n');

    const finalStatus = abortRef.current ? 'paused' : 'completed';

    currentSteps.forEach((s) => {
      if (s.status === 'running') {
        s.status = 'paused';
      }
    });

    updateWorkflowExecution(newRecord.id, {
      steps: currentSteps,
      finalOutput,
      status: finalStatus,
      completedAt,
      totalDuration,
    });

    setExecutionRecord({
      ...newRecord,
      steps: currentSteps,
      finalOutput,
      status: finalStatus,
      completedAt,
      totalDuration,
    });

    setIsRunning(false);
    setPhase('finished');
  };

  const handlePause = () => {
    if (!executionRecord) return;
    abortRef.current = true;
    pausedAtRef.current = Date.now();
    pauseExecution(executionRecord.id);
    setIsPaused(true);
    setIsRunning(false);
  };

  const handleReExecute = () => {
    if (!executionRecord) return;
    const newExec = reExecuteFromRecord(executionRecord.id);
    if (newExec) {
      setExecutionRecord(newExec);
      setInput(newExec.initialInput);
      setVariableValues(newExec.variableValues || {});
      setStepVariableValues(newExec.stepVariableValues || {});
      setStepResults(newExec.steps.map(() => ({ expanded: false })));
      setFinalExpanded(false);
      setPhase('running');
      setIsRunning(false);
      setIsPaused(false);
    }
  };

  const handleSaveAsNew = () => {
    if (!executionRecord || !saveAsName.trim()) return;
    const newWorkflow = saveAsNewWorkflow(executionRecord.id, saveAsName.trim(), saveAsDesc.trim());
    if (newWorkflow) {
      setShowSaveAsDialog(false);
      setSaveAsName('');
      setSaveAsDesc('');
      onClose();
    }
  };

  const handleSaveStepToTasks = (stepIndex: number) => {
    if (!executionRecord) return;
    const step = executionRecord.steps[stepIndex];
    if (!step || step.status !== 'completed') return;

    const tool = getToolInfo(step.toolId);
    if (!tool) return;

    const newTask = addRecord({
      toolId: tool.id,
      toolName: tool.name,
      toolIcon: tool.icon,
      promptId: step.promptId,
      promptTitle: step.promptTitle,
      input: step.input,
      output: step.output,
      rating: 0,
      isFavorite: false,
      duration: step.duration || 0,
      quotaUsed: 1,
      createdBy: '张三',
      gradientFrom: tool.gradientFrom,
      gradientTo: tool.gradientTo,
    });

    saveStepToTasks(executionRecord.id, stepIndex, newTask.id);
    setExecutionRecord({
      ...executionRecord,
      savedToTasks: [...(executionRecord.savedToTasks || []), newTask.id],
    });
  };

  const handleVariableChange = (
    nodeId: string,
    varName: string,
    value: string
  ) => {
    setStepVariableValues((prev) => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        [varName]: value,
      },
    }));
  };

  const toggleStepExpand = (index: number) => {
    setStepResults((prev) =>
      prev.map((s, i) => (i === index ? { ...s, expanded: !s.expanded } : s))
    );
  };

  const getStepStatusIcon = (status: WorkflowExecutionStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-accent-secondary" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-accent-danger" />;
      case 'skipped':
        return <Archive className="w-4 h-4 text-text-tertiary" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-accent-warning" />;
      default:
        return <Circle className="w-4 h-4 text-text-tertiary" />;
    }
  };

  const getStatusBadge = (status: WorkflowExecutionRecord['status']) => {
    const styles: Record<string, string> = {
      pending: 'bg-bg-tertiary/80 text-text-tertiary border-border-secondary',
      running: 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30',
      paused: 'bg-accent-warning/20 text-accent-warning border border-accent-warning/30',
      completed: 'bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30',
      error: 'bg-accent-danger/20 text-accent-danger border border-accent-danger/30',
    };
    const labels: Record<string, string> = {
      pending: '待执行',
      running: '执行中',
      paused: '已暂停',
      completed: '成功',
      error: '失败',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-md font-medium ${styles[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-4xl max-h-[85vh] overflow-hidden animate-fadeInUp flex flex-col rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-secondary">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-secondary/20 flex items-center justify-center"
            >
              <GitBranch className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-text-primary">{workflow.name}</h3>
                {isReplay && executionRecord && getStatusBadge(executionRecord.status)}
              </div>
              <p className="text-sm text-text-tertiary mt-0.5">
                {workflow.description || '自动化工作流'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {phase === 'finished' && !isReplay && (
              <>
                <button
                  onClick={handleReExecute}
                  className="h-9 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  重新执行
                </button>
                <button
                  onClick={() => setShowSaveAsDialog(true)}
                  className="h-9 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all flex items-center gap-1.5"
                >
                  <FolderPlus className="w-4 h-4" />
                  另存流程
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-bg-tertiary/50 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {phase === 'form' && (
            <div className="space-y-6">
              <div>
                <label className="text-xs text-text-secondary font-medium mb-1.5 block flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-accent-primary" />
                  初始输入内容
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入需要处理的原始内容...&#10;&#10;例如：一篇需要处理的博客草稿、一段需要翻译的文本、一份需要整理的会议录音转写等。"
                  rows={4}
                  className="w-full p-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm resize-none focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                />
              </div>

              {Object.keys(groupedFormItems).length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent-warning" />
                    <h4 className="font-medium text-text-primary">模板变量配置</h4>
                    <span className="text-xs text-text-tertiary">
                      （按步骤填写，将自动应用到对应提示词模板）
                    </span>
                  </div>

                  {Object.entries(groupedFormItems).map(([stepIdxStr, items]) => {
                    const stepIdx = parseInt(stepIdxStr, 10);
                    const node = toolNodes[stepIdx];
                    const tool = node ? getToolInfo(node.data.toolId || '') : null;

                    return (
                      <div
                        key={stepIdxStr}
                        className="p-4 rounded-xl bg-bg-tertiary/30 border border-border-secondary"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary text-white text-xs font-semibold flex items-center justify-center">
                            {stepIdx + 1}
                          </div>
                          <p className="text-sm font-medium text-text-primary">
                            {tool?.name || `步骤 ${stepIdx + 1}`}
                          </p>
                          {node?.data.promptTitle && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-accent-warning/20 text-accent-warning border border-accent-warning/30">
                              <FileText className="w-3 h-3" />
                              {node.data.promptTitle}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {items.map((item) => {
                            const value =
                              stepVariableValues[item.nodeId]?.[item.name] ||
                              variableValues[item.name] ||
                              '';
                            return (
                              <div key={`${item.nodeId}-${item.name}`}>
                                <label className="text-xs text-text-secondary font-medium mb-1 block flex items-center gap-1">
                                  {item.label}
                                  {item.required && (
                                    <span className="text-accent-danger">*</span>
                                  )}
                                </label>
                                {item.type === 'select' ? (
                                  <select
                                    value={value}
                                    onChange={(e) =>
                                      handleVariableChange(item.nodeId, item.name, e.target.value)
                                    }
                                    className="w-full h-9 px-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary text-xs focus:outline-none focus:border-accent-primary/50 transition-all cursor-pointer"
                                  >
                                    <option value="">请选择{item.label}</option>
                                    {item.options?.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : item.type === 'textarea' ? (
                                  <textarea
                                    value={value}
                                    onChange={(e) =>
                                      handleVariableChange(item.nodeId, item.name, e.target.value)
                                    }
                                    placeholder={item.placeholder}
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary text-xs resize-none focus:outline-none focus:border-accent-primary/50 transition-all"
                                  />
                                ) : (
                                  <input
                                    type={item.type === 'number' ? 'number' : 'text'}
                                    value={value}
                                    onChange={(e) =>
                                      handleVariableChange(item.nodeId, item.name, e.target.value)
                                    }
                                    placeholder={item.placeholder}
                                    className="w-full h-9 px-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary text-xs focus:outline-none focus:border-accent-primary/50 transition-all"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {executionPlan.length > 1 && (
                <div className="p-4 rounded-xl bg-accent-secondary/5 border border-accent-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-accent-secondary" />
                    <p className="text-sm font-medium text-text-primary">执行优化提示</p>
                  </div>
                  <p className="text-xs text-text-secondary">
                    此工作流包含 {executionPlan.length} 个执行阶段，其中{' '}
                    {executionPlan.filter((b) => b.length > 1).length} 个阶段支持并行执行，
                    可显著提升处理效率。
                  </p>
                </div>
              )}
            </div>
          )}

          {(phase === 'running' || phase === 'finished') && executionRecord && (
            <div className="space-y-5">
              {!isReplay && (
                <div className="p-4 rounded-xl bg-bg-tertiary/30 border border-border-secondary">
                  <p className="text-xs text-text-secondary font-medium mb-1.5">初始输入内容</p>
                  <p className="text-sm text-text-primary whitespace-pre-wrap line-clamp-3">
                    {executionRecord.initialInput}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-text-primary flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent-secondary" />
                    执行步骤
                  </h4>
                  {executionRecord.totalDuration && (
                    <span className="text-xs text-text-tertiary flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      总耗时 {(executionRecord.totalDuration / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {executionRecord.steps.map((step, index) => {
                    const tool = getToolInfo(step.toolId);
                    const prompt = getPromptInfo(step.promptId);
                    const stepResult = stepResults[index] || { expanded: false };
                    const IconComp = tool ? getIconByName(tool.icon) : Wrench;
                    const isSaved = executionRecord.savedToTasks?.length
                      ? executionRecord.steps
                          .slice(0, index)
                          .some((s) => s.status === 'completed')
                      : false;

                    return (
                      <div
                        key={step.nodeId || index}
                        className={`rounded-xl border overflow-hidden transition-all ${
                          step.status === 'error'
                            ? 'border-accent-danger/50 bg-accent-danger/5'
                            : step.status === 'skipped'
                            ? 'border-border-secondary bg-bg-tertiary/20 opacity-60'
                            : 'border-border-secondary bg-bg-tertiary/30'
                        }`}
                      >
                        <div
                          className="p-3 flex items-center gap-3 cursor-pointer hover:bg-bg-tertiary/50 transition-all"
                          onClick={() => toggleStepExpand(index)}
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 shadow-md">
                            {index + 1}
                          </div>
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: tool
                                ? `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`
                                : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                            }}
                          >
                            {IconComp ? (
                              <IconComp className="w-4 h-4 text-white" />
                            ) : (
                              <Wrench className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {step.toolName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {getStepStatusIcon(step.status)}
                              <span className="text-[11px] text-text-tertiary">
                                {step.status === 'completed' && step.duration
                                  ? `完成 · ${(step.duration / 1000).toFixed(1)}s`
                                  : step.status === 'running'
                                  ? '执行中...'
                                  : step.status === 'skipped'
                                  ? step.skippedReason || '已跳过'
                                  : step.status === 'paused'
                                  ? '已暂停'
                                  : step.status === 'error'
                                  ? '执行失败'
                                  : '等待执行'}
                              </span>
                              {prompt && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-accent-warning/20 text-accent-warning border border-accent-warning/30 ml-1">
                                  <FileText className="w-3 h-3" />
                                  {prompt.title}
                                </span>
                              )}
                            </div>
                          </div>
                          {phase === 'finished' && step.status === 'completed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveStepToTasks(index);
                              }}
                              className="h-7 px-2.5 rounded-lg bg-accent-primary/10 text-accent-primary text-xs font-medium hover:bg-accent-primary/20 transition-all flex items-center gap-1 mr-2"
                              title="保存到任务记录"
                            >
                              <Save className="w-3 h-3" />
                              保存
                            </button>
                          )}
                          {stepResult.expanded ? (
                            <ChevronDown className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                          )}
                        </div>

                        {stepResult.expanded && (
                          <div className="px-3 pb-4 pt-2 border-t border-border-secondary bg-bg-tertiary/20 space-y-3">
                            {step.input && (
                              <div>
                                <p className="text-[11px] text-text-secondary font-medium mb-1">
                                  输入内容
                                </p>
                                <div className="p-3 rounded-lg bg-bg-tertiary/50 border border-border-secondary">
                                  <p className="text-xs text-text-primary whitespace-pre-wrap">
                                    {step.input}
                                  </p>
                                </div>
                              </div>
                            )}
                            {step.output && (
                              <div>
                                <p className="text-[11px] text-text-secondary font-medium mb-1">
                                  输出结果
                                </p>
                                <div className="p-3 rounded-lg bg-accent-secondary/5 border border-accent-secondary/20">
                                  <p className="text-xs text-text-primary whitespace-pre-wrap">
                                    {step.output}
                                  </p>
                                </div>
                              </div>
                            )}
                            {Object.keys(step.variableValues || {}).length > 0 && (
                              <div>
                                <p className="text-[11px] text-text-secondary font-medium mb-1.5">
                                  变量值
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {Object.entries(step.variableValues || {}).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="px-2 py-0.5 text-[10px] rounded-md bg-bg-tertiary/80 text-text-secondary border border-border-secondary"
                                    >
                                      {k}: {v}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {phase === 'finished' && executionRecord.finalOutput && (
                <div>
                  <div
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => setFinalExpanded(!finalExpanded)}
                  >
                    <h4 className="font-medium text-text-primary flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent-secondary" />
                      🎉 工作流执行完成
                    </h4>
                    {executionRecord.completedAt && (
                      <span className="text-xs text-text-tertiary">
                        完成于 {executionRecord.completedAt}
                      </span>
                    )}
                  </div>
                  {finalExpanded ? (
                    <div className="p-4 rounded-xl bg-accent-secondary/5 border border-accent-secondary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-secondary font-medium">
                          完整输出结果
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(executionRecord.finalOutput)}
                          className="h-7 px-2.5 rounded-lg bg-bg-tertiary/50 text-text-secondary text-xs hover:text-text-primary transition-all flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          复制全部
                        </button>
                      </div>
                      <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
                        {executionRecord.finalOutput}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-accent-secondary/5 border border-accent-secondary/20 flex items-center justify-between">
                      <p className="text-xs text-text-secondary">
                        共执行 {executionRecord.steps.filter((s) => s.status === 'completed').length} 个步骤
                      </p>
                      <button className="text-xs text-accent-secondary flex items-center gap-1">
                        查看详情 <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-5 border-t border-border-secondary bg-bg-secondary/30">
          {executionRecord?.isOrphan && (
            <div className="flex items-center gap-2 text-xs text-accent-warning">
              <AlertTriangle className="w-3 h-3" />
              <span>原工作流已删除，记录保留但无法再次执行</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-3">
            {phase === 'form' && (
              <>
                <button
                  onClick={onClose}
                  className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleRun}
                  disabled={!isFormValid || isRunning}
                  className={`h-10 px-6 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                    !isFormValid || isRunning
                      ? 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                      : 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:shadow-glow glow-btn'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  开始执行
                </button>
              </>
            )}
            {phase === 'running' && (
              <>
                {isPaused ? (
                  <button
                    onClick={handleRun}
                    className="h-10 px-6 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 hover:shadow-glow glow-btn transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    继续执行
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    暂停
                  </button>
                )}
                <button
                  onClick={() => {
                    abortRef.current = true;
                    onClose();
                  }}
                  className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
                >
                  关闭
                </button>
                <button
                  disabled
                  className="h-10 px-6 rounded-xl bg-accent-primary/20 text-accent-primary text-sm font-medium flex items-center gap-2 cursor-not-allowed"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  执行中...
                </button>
              </>
            )}
            {phase === 'finished' && (
              <button
                onClick={onClose}
                className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
              >
                关闭
              </button>
            )}
          </div>
        </div>
      </div>

      {showSaveAsDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-5 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-text-primary mb-4">另存为新工作流</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary font-medium mb-1.5 block">
                  工作流名称
                </label>
                <input
                  value={saveAsName}
                  onChange={(e) => setSaveAsName(e.target.value)}
                  placeholder="请输入新工作流名称"
                  className="w-full h-10 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary text-sm focus:outline-none focus:border-accent-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary font-medium mb-1.5 block">
                  工作流描述（可选）
                </label>
                <textarea
                  value={saveAsDesc}
                  onChange={(e) => setSaveAsDesc(e.target.value)}
                  placeholder="描述这个工作流的用途..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary text-sm resize-none focus:outline-none focus:border-accent-primary/50 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => setShowSaveAsDialog(false)}
                className="h-9 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSaveAsNew}
                disabled={!saveAsName.trim()}
                className={`h-9 px-4 rounded-xl text-sm font-medium transition-all ${
                  !saveAsName.trim()
                    ? 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:shadow-glow'
                }`}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
