import { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
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
} from 'lucide-react';
import { Workflow, WorkflowExecutionRecord } from '@/types';
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

export function WorkflowExecutor({ isOpen, onClose, workflow, existingExecution }: WorkflowExecutorProps) {
  const {
    addWorkflowExecution,
    updateWorkflowExecution,
    incrementWorkflowUseCount,
  } = useTeamStore();
  const { prompts, incrementUseCount } = usePromptStore();
  const { addRecord } = useTaskStore();

  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [executionRecord, setExecutionRecord] = useState<WorkflowExecutionRecord | null>(
    existingExecution || null
  );
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [finalExpanded, setFinalExpanded] = useState(false);
  const startAtRef = useRef<number | null>(null);

  const toolNodes = workflow.nodes.filter((n) => n.type === 'tool');

  useEffect(() => {
    if (!isOpen) return;
    if (existingExecution) {
      setExecutionRecord(existingExecution);
      setStepResults(
        existingExecution.steps.map(() => ({ expanded: false }))
      );
      setFinalExpanded(false);
    } else {
      setExecutionRecord(null);
      setInput('');
      setCurrentStepIndex(-1);
      setIsRunning(false);
      setStepResults(toolNodes.map(() => ({ expanded: false })));
    }
  }, [isOpen, workflow.id, existingExecution, toolNodes.length]);

  if (!isOpen) return null;

  const getToolInfo = (toolId: string) => {
    return tools.find((t) => t.id === toolId);
  };

  const getPromptInfo = (promptId?: string) => {
    if (!promptId) return null;
    return prompts.find((p) => p.id === promptId);
  };

  const mockExecuteStep = async (
    stepInput: string,
    toolId: string,
    promptId?: string
  ): Promise<string> => {
    const tool = getToolInfo(toolId);
    const prompt = getPromptInfo(promptId);
    await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));

    let baseOutput = '';
    if (prompt) {
      const vars = prompt.variables;
      let resolvedPrompt = prompt.content;
      vars.forEach((v, i) => {
        const replacement = stepInput.slice(0, 20 + i * 5) || `[${v}]`;
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

  const buildInitialSteps = () => {
    return toolNodes.map((node, index) => ({
      stepIndex: index,
      toolId: node.data.toolId || '',
      toolName: getToolInfo(node.data.toolId || '')?.name || '未知工具',
      promptId: node.data.promptId,
      promptTitle: node.data.promptTitle,
      input: '',
      output: '',
      status: 'pending' as const,
    }));
  };

  const handleRun = async () => {
    if (!input.trim() || isRunning) return;

    incrementWorkflowUseCount(workflow.id);
    startAtRef.current = Date.now();

    const startTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\//g, '-');

    const newRecord = addWorkflowExecution({
      workflowId: workflow.id,
      workflowName: workflow.name,
      initialInput: input.trim(),
      steps: buildInitialSteps(),
      finalOutput: '',
      status: 'running',
      startedAt: startTime,
    });

    setExecutionRecord(newRecord);
    setIsRunning(true);
    setStepResults(toolNodes.map(() => ({ expanded: false })));

    let currentInput = input.trim();
    const updatedSteps = [...newRecord.steps];

    for (let i = 0; i < toolNodes.length; i++) {
      const node = toolNodes[i];
      const toolId = node.data.toolId || '';
      const promptId = node.data.promptId;
      const tool = getToolInfo(toolId);

      setCurrentStepIndex(i);
      updatedSteps[i] = {
        ...updatedSteps[i],
        input: currentInput,
        status: 'running',
        startTime: Date.now(),
      };
      setExecutionRecord((prev) =>
        prev ? { ...prev, steps: [...updatedSteps] } : prev
      );
      updateWorkflowExecution(newRecord.id, {
        steps: [...updatedSteps],
      });

      if (promptId) {
        incrementUseCount(promptId);
      }

      try {
        const output = await mockExecuteStep(currentInput, toolId, promptId);
        const endTime = Date.now();
        updatedSteps[i] = {
          ...updatedSteps[i],
          output,
          status: 'completed',
          endTime,
          duration: endTime - (updatedSteps[i].startTime || endTime),
        };
        setExecutionRecord((prev) =>
          prev ? { ...prev, steps: [...updatedSteps] } : prev
        );
        updateWorkflowExecution(newRecord.id, {
          steps: [...updatedSteps],
        });
        currentInput = output;

        if (tool) {
          addRecord({
            toolId: tool.id,
            toolName: tool.name,
            toolIcon: tool.icon,
            promptId,
            promptTitle: node.data.promptTitle,
            input: updatedSteps[i].input,
            output,
            rating: 0,
            isFavorite: false,
            duration: updatedSteps[i].duration || 0,
            quotaUsed: Math.floor(Math.random() * 1000) + 100,
            createdBy: '张三',
            gradientFrom: tool.gradientFrom,
            gradientTo: tool.gradientTo,
          });
        }
      } catch {
        updatedSteps[i] = {
          ...updatedSteps[i],
          output: '执行出错，请稍后重试。',
          status: 'error',
        };
        setExecutionRecord((prev) =>
          prev
            ? { ...prev, steps: [...updatedSteps], status: 'error' }
            : prev
        );
        updateWorkflowExecution(newRecord.id, {
          steps: [...updatedSteps],
          status: 'error',
        });
        setIsRunning(false);
        setCurrentStepIndex(-1);
        return;
      }
    }

    const completedAt = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).replace(/\//g, '-');

    const totalDuration = startAtRef.current ? Date.now() - startAtRef.current : 0;
    setExecutionRecord((prev) =>
      prev
        ? {
            ...prev,
            finalOutput: currentInput,
            status: 'completed',
            completedAt,
            totalDuration,
          }
        : prev
    );
    updateWorkflowExecution(newRecord.id, {
      finalOutput: currentInput,
      status: 'completed',
      completedAt,
      totalDuration,
    });
    setIsRunning(false);
    setCurrentStepIndex(-1);
    setFinalExpanded(true);
  };

  const toggleStepExpand = (index: number) => {
    setStepResults((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, expanded: !s.expanded } : s
      )
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string, stepIdx: number) => {
    if (status === 'running' || stepIdx === currentStepIndex) {
      return <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />;
    }
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-accent-secondary" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-accent-danger" />;
      case 'pending':
      default:
        return <Circle className="w-4 h-4 text-text-tertiary" />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const canRun =
    !isRunning &&
    input.trim().length > 0 &&
    (!executionRecord || executionRecord.status !== 'running');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-4xl max-h-[88vh] overflow-hidden animate-fadeInUp flex flex-col rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-secondary">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-secondary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {workflow.name}
              </h3>
              <p className="text-xs text-text-tertiary mt-0.5">
                {workflow.description || `${toolNodes.length} 个工具串行执行`}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  {toolNodes.length} 个工具
                </span>
                {executionRecord?.totalDuration && (
                  <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    总耗时 {formatDuration(executionRecord.totalDuration)}
                  </span>
                )}
                {executionRecord?.createdAt && (
                  <span className="text-[10px] text-text-tertiary">
                    执行于 {executionRecord.createdAt}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-bg-tertiary/50 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-bg-tertiary/30 border border-border-secondary">
              <label className="text-xs text-text-secondary font-medium mb-2 block flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                初始输入内容
              </label>
              {existingExecution ? (
                <div className="p-3 rounded-lg bg-bg-primary/50 text-sm text-text-primary whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                  {executionRecord?.initialInput}
                </div>
              ) : (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入需要处理的原始内容...

例如：一篇需要处理的博客草稿、一段需要翻译的文本、一份需要整理的会议录音转写等。"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-bg-primary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm resize-none focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-accent-secondary" />
                  <h4 className="font-medium text-text-primary text-sm">执行步骤</h4>
                </div>
                {currentStepIndex >= 0 && (
                  <span className="text-xs text-accent-primary flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    正在执行步骤 {currentStepIndex + 1} / {toolNodes.length}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {toolNodes.map((node, index) => {
                  const tool = getToolInfo(node.data.toolId || '');
                  const prompt = getPromptInfo(node.data.promptId);
                  const IconComponent = tool
                    ? getIconByName(tool.icon) || Wrench
                    : Wrench;
                  const stepData = executionRecord?.steps[index];
                  const status = stepData?.status || 'pending';
                  const isExpanded = stepResults[index]?.expanded;
                  const isActive = currentStepIndex === index || status === 'running';

                  return (
                    <div
                      key={node.id}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        isActive
                          ? 'border-accent-primary/50 bg-accent-primary/5 shadow-glow-sm'
                          : status === 'completed'
                          ? 'border-accent-secondary/30 bg-bg-tertiary/30'
                          : status === 'error'
                          ? 'border-accent-danger/30 bg-accent-danger/5'
                          : 'border-border-secondary bg-bg-tertiary/30'
                      }`}
                    >
                      <div
                        className={`p-3 flex items-center gap-3 ${
                          status !== 'pending' ? 'cursor-pointer hover:bg-bg-tertiary/50' : ''
                        } transition-all`}
                        onClick={() => status !== 'pending' && toggleStepExpand(index)}
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 shadow-md">
                          {index + 1}
                        </div>
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: tool
                              ? `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`
                              : '#666',
                          }}
                        >
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {tool?.name || '未知工具'}
                            </p>
                            {getStatusIcon(status, index)}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {prompt ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-accent-warning/20 text-accent-warning border border-accent-warning/30">
                                <FileText className="w-2.5 h-2.5" />
                                {node.data.promptTitle || prompt.title}
                              </span>
                            ) : (
                              <span className="text-[10px] text-text-tertiary px-1.5 py-0.5 rounded-md bg-bg-tertiary/80 border border-border-secondary">
                                无模板
                              </span>
                            )}
                            {tool && (
                              <span className="text-[10px] text-text-tertiary">
                                适合: {tool.suitableRoles.slice(0, 2).join('、')}
                                {tool.suitableRoles.length > 2 && '等'}
                              </span>
                            )}
                            {stepData?.duration && (
                              <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {formatDuration(stepData.duration)}
                              </span>
                            )}
                          </div>
                        </div>
                        {status !== 'pending' &&
                          (isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                          ))}
                      </div>

                      {isExpanded && stepData && (
                        <div className="px-3 pb-3 pt-2 border-t border-border-secondary/60 bg-bg-primary/30 space-y-2.5">
                          <div>
                            <p className="text-[10px] text-text-secondary font-medium mb-1">
                              ▶ 输入内容
                            </p>
                            <div className="p-2.5 rounded-lg bg-bg-tertiary/50 text-xs text-text-secondary whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                              {stepData.input || '(无)'}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] text-text-secondary font-medium flex items-center gap-1">
                                ✔ 输出结果
                                {stepData.status === 'error' && (
                                  <span className="text-accent-danger">（执行出错）</span>
                                )}
                              </p>
                              <button
                                onClick={() => copyToClipboard(stepData.output)}
                                className="text-[10px] text-text-tertiary hover:text-accent-primary flex items-center gap-1 transition-colors"
                              >
                                <Copy className="w-2.5 h-2.5" />
                                复制
                              </button>
                            </div>
                            <div className="p-2.5 rounded-lg bg-accent-secondary/5 border border-accent-secondary/20 text-xs text-text-primary whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                              {stepData.output || '(无)'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {executionRecord &&
              (executionRecord.status === 'completed' ||
                executionRecord.status === 'error') && (
                <div
                  className={`rounded-xl border overflow-hidden ${
                    executionRecord.status === 'completed'
                      ? 'border-accent-secondary/30'
                      : 'border-accent-danger/30'
                  }`}
                >
                  <div
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-all ${
                      executionRecord.status === 'completed'
                        ? 'bg-gradient-to-r from-accent-secondary/10 to-transparent'
                        : 'bg-gradient-to-r from-accent-danger/10 to-transparent'
                    }`}
                    onClick={() => setFinalExpanded(!finalExpanded)}
                  >
                    {executionRecord.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-accent-secondary flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-accent-danger flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">
                        {executionRecord.status === 'completed'
                          ? '🎉 工作流执行完成'
                          : '⚠ 工作流执行失败'}
                      </p>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        共执行 {toolNodes.length} 个步骤
                        {executionRecord.completedAt &&
                          `，完成于 ${executionRecord.completedAt}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(executionRecord.finalOutput);
                        }}
                        className="px-3 h-8 rounded-lg bg-bg-tertiary/50 text-text-secondary text-xs hover:text-text-primary hover:bg-bg-tertiary transition-all flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        复制结果
                      </button>
                      {finalExpanded ? (
                        <ChevronDown className="w-4 h-4 text-text-tertiary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-text-tertiary" />
                      )}
                    </div>
                  </div>
                  {finalExpanded && (
                    <div className="p-4 bg-bg-primary/30 border-t border-border-secondary/60">
                      <div className="p-3 rounded-xl bg-bg-tertiary/30 border border-border-secondary text-sm text-text-primary whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                        {executionRecord.finalOutput || '(无最终输出)'}
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-5 border-t border-border-secondary bg-bg-secondary/30">
          <div className="text-xs text-text-tertiary">
            {!existingExecution && !executionRecord ? (
              <span>输入内容后点击「开始执行」，系统将按顺序调用每个工具</span>
            ) : executionRecord?.status === 'running' ? (
              <span className="text-accent-primary flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                工作流正在执行中...
              </span>
            ) : executionRecord?.status === 'completed' ? (
              <span>执行成功！结果已保存至任务记录和执行历史</span>
            ) : (
              <span>此为历史执行记录，可查看每一步的详细输入输出</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
            >
              {executionRecord?.status === 'completed' || existingExecution
                ? '关闭'
                : '取消'}
            </button>
            {!existingExecution && (
              <button
                onClick={handleRun}
                disabled={!canRun}
                className={`h-10 px-5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                  !canRun
                    ? 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:shadow-glow glow-btn'
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    执行中...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    开始执行
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
