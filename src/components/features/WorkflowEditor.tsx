import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Wrench,
  ArrowRight,
  FileText,
  ChevronDown as ChevronDownIcon,
  Sparkles,
  GitBranch,
  Link2,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Workflow, Tool, Prompt, WorkflowNode } from '@/types';
import { tools } from '@/data/tools';
import { useTeamStore } from '@/store/useTeamStore';
import { usePromptStore } from '@/store/usePromptStore';
import { getIconByName } from '@/utils/iconHelper';

interface WorkflowEditorProps {
  isOpen: boolean;
  onClose: () => void;
  workflow?: Workflow;
}

interface SelectedTool {
  nodeId: string;
  toolId: string;
  name: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  description: string;
  suitableRoles: string[];
  promptId?: string;
  promptTitle?: string;
  dependsOn: string[];
  branchGroup?: string;
}

const BRANCH_GROUPS = [
  { id: 'none', name: '不分组（串行）' },
  { id: 'parallel_a', name: '并行组 A' },
  { id: 'parallel_b', name: '并行组 B' },
  { id: 'parallel_c', name: '并行组 C' },
];

const CONDITION_OPERATORS = [
  { value: 'contains', label: '包含' },
  { value: 'equals', label: '等于' },
  { value: 'startsWith', label: '开头是' },
  { value: 'lengthGt', label: '长度大于' },
];

function topologicalSort(nodes: WorkflowNode[]): WorkflowNode[] {
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};

  nodes.forEach((n) => {
    inDegree[n.id] = n.data.dependsOn?.length || 0;
    adjList[n.id] = [];
  });

  nodes.forEach((n) => {
    n.data.dependsOn?.forEach((depId) => {
      if (adjList[depId]) {
        adjList[depId].push(n.id);
      }
    });
  });

  const queue: string[] = [];
  Object.keys(inDegree).forEach((id) => {
    if (inDegree[id] === 0) queue.push(id);
  });

  const result: WorkflowNode[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const node = nodeMap.get(currentId);
    if (node) result.push(node);

    adjList[currentId]?.forEach((nextId) => {
      inDegree[nextId]--;
      if (inDegree[nextId] === 0) queue.push(nextId);
    });
  }

  return result.length === nodes.length ? result : nodes;
}

export function WorkflowEditor({ isOpen, onClose, workflow }: WorkflowEditorProps) {
  const { addWorkflow, updateWorkflow } = useTeamStore();
  const { prompts } = usePromptStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTools, setSelectedTools] = useState<SelectedTool[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isEditing = !!workflow;

  useEffect(() => {
    if (!isOpen) return;
    setShowSuccess(false);

    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description);

      const toolNodes = workflow.nodes
        .filter((node) => node.type === 'tool' && node.data.toolId)
        .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);

      const toolsFromNodes: SelectedTool[] = [];
      toolNodes.forEach((node) => {
        const tool = tools.find((t) => t.id === node.data.toolId);
        if (tool) {
          toolsFromNodes.push({
            nodeId: node.id,
            toolId: tool.id,
            name: tool.name,
            icon: tool.icon,
            gradientFrom: tool.gradientFrom,
            gradientTo: tool.gradientTo,
            description: tool.description,
            suitableRoles: tool.suitableRoles,
            promptId: node.data.promptId,
            promptTitle: node.data.promptTitle,
            dependsOn: node.data.dependsOn || [],
            branchGroup: node.data.branchGroup,
          });
        }
      });

      setSelectedTools(toolsFromNodes);
      setExpandedStep(null);
    } else {
      setName('');
      setDescription('');
      setSelectedTools([]);
      setExpandedStep(null);
    }
  }, [workflow, isOpen]);

  if (!isOpen) return null;

  const handleAddTool = (tool: Tool) => {
    const alreadySelected = selectedTools.some((t) => t.toolId === tool.id);
    if (!alreadySelected) {
      setSelectedTools([
        ...selectedTools,
        {
          nodeId: `n${Date.now()}_${selectedTools.length + 1}`,
          toolId: tool.id,
          name: tool.name,
          icon: tool.icon,
          gradientFrom: tool.gradientFrom,
          gradientTo: tool.gradientTo,
          description: tool.description,
          suitableRoles: tool.suitableRoles,
          dependsOn: selectedTools.length > 0 ? [selectedTools[selectedTools.length - 1].nodeId] : [],
        },
      ]);
    }
  };

  const handleRemoveTool = (index: number) => {
    const removedId = selectedTools[index].nodeId;
    const newTools = selectedTools.filter((_, i) => i !== index);

    const cleanedTools = newTools.map((t) => ({
      ...t,
      dependsOn: t.dependsOn.filter((id) => id !== removedId),
    }));

    if (index > 0 && cleanedTools[index]) {
      const prevId = cleanedTools[index - 1].nodeId;
      cleanedTools[index] = {
        ...cleanedTools[index],
        dependsOn: [...new Set([...cleanedTools[index].dependsOn, prevId])],
      };
    }

    setSelectedTools(cleanedTools);
    if (expandedStep === index) {
      setExpandedStep(null);
    } else if (expandedStep !== null && expandedStep > index) {
      setExpandedStep(expandedStep - 1);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newTools = [...selectedTools];
      [newTools[index - 1], newTools[index]] = [newTools[index], newTools[index - 1]];

      const upperId = newTools[index].nodeId;
      const lowerId = newTools[index - 1].nodeId;

      newTools[index] = {
        ...newTools[index],
        dependsOn: newTools[index].dependsOn.filter((id) => id !== lowerId),
      };
      newTools[index - 1] = {
        ...newTools[index - 1],
        dependsOn: [...new Set([...newTools[index - 1].dependsOn, upperId])],
      };

      setSelectedTools(newTools);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < selectedTools.length - 1) {
      const newTools = [...selectedTools];
      [newTools[index + 1], newTools[index]] = [newTools[index], newTools[index + 1]];

      const lowerId = newTools[index].nodeId;
      const upperId = newTools[index + 1].nodeId;

      newTools[index] = {
        ...newTools[index],
        dependsOn: [...new Set([...newTools[index].dependsOn, upperId])],
      };
      newTools[index + 1] = {
        ...newTools[index + 1],
        dependsOn: newTools[index + 1].dependsOn.filter((id) => id !== lowerId),
      };

      setSelectedTools(newTools);
    }
  };

  const handleBindPrompt = (stepIndex: number, promptId: string | null) => {
    setSelectedTools(
      selectedTools.map((t, i) => {
        if (i !== stepIndex) return t;
        if (promptId === null) {
          return { ...t, promptId: undefined, promptTitle: undefined };
        }
        const prompt = prompts.find((p) => p.id === promptId);
        return {
          ...t,
          promptId,
          promptTitle: prompt?.title,
        };
      })
    );
  };

  const handleToggleDependency = (stepIndex: number, depNodeId: string) => {
    setSelectedTools(
      selectedTools.map((t, i) => {
        if (i !== stepIndex) return t;
        const hasDep = t.dependsOn.includes(depNodeId);
        return {
          ...t,
          dependsOn: hasDep
            ? t.dependsOn.filter((id) => id !== depNodeId)
            : [...t.dependsOn, depNodeId],
        };
      })
    );
  };

  const handleSetBranchGroup = (stepIndex: number, groupId: string | undefined) => {
    setSelectedTools(
      selectedTools.map((t, i) => {
        if (i !== stepIndex) return t;
        return {
          ...t,
          branchGroup: groupId === 'none' ? undefined : groupId,
        };
      })
    );
  };

  const toggleExpandStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  const handleSave = () => {
    if (!name.trim() || selectedTools.length === 0) return;

    const toolNodes: WorkflowNode[] = selectedTools.map((tool, index) => ({
      id: tool.nodeId,
      type: 'tool' as const,
      position: { x: 350 + index * 250, y: 100 },
      data: {
        label: tool.name,
        toolId: tool.toolId,
        promptId: tool.promptId,
        promptTitle: tool.promptTitle,
        dependsOn: tool.dependsOn,
        branchGroup: tool.branchGroup,
        nodeType: 'tool' as const,
      },
    }));

    const sortedToolNodes = topologicalSort(toolNodes);

    const inputNode: WorkflowNode = {
      id: 'n0',
      type: 'input' as const,
      position: { x: 100, y: 100 },
      data: { label: '输入', nodeType: 'start' as const },
    };

    const outputNode: WorkflowNode = {
      id: `n${Date.now()}_out`,
      type: 'output' as const,
      position: { x: 350 + selectedTools.length * 250, y: 100 },
      data: { label: '输出', nodeType: 'end' as const },
    };

    const allNodes = [inputNode, ...sortedToolNodes, outputNode];

    const edges: { id: string; source: string; target: string }[] = [];
    sortedToolNodes.forEach((node) => {
      if (!node.data.dependsOn || node.data.dependsOn.length === 0) {
        edges.push({
          id: `e_n0_${node.id}`,
          source: 'n0',
          target: node.id,
        });
      } else {
        node.data.dependsOn.forEach((depId) => {
          edges.push({
            id: `e_${depId}_${node.id}`,
            source: depId,
            target: node.id,
          });
        });
      }
    });

    const lastToolId = sortedToolNodes[sortedToolNodes.length - 1]?.id;
    if (lastToolId) {
      edges.push({
        id: `e_${lastToolId}_out`,
        source: lastToolId,
        target: outputNode.id,
      });
    }

    const workflowData = {
      name: name.trim(),
      description: description.trim(),
      nodes: allNodes,
      edges,
    };

    if (isEditing && workflow) {
      updateWorkflow(workflow.id, workflowData);
    } else {
      addWorkflow(workflowData);
    }

    setShowSuccess(true);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const isToolSelected = (toolId: string) => {
    return selectedTools.some((t) => t.toolId === toolId);
  };

  const dependencyInfo = useMemo(() => {
    return selectedTools.map((tool, idx) => {
      const deps = tool.dependsOn
        .map((id) => selectedTools.find((t) => t.nodeId === id)?.name)
        .filter(Boolean);
      const hasCycle = tool.dependsOn.some((depId) => {
        const depIdx = selectedTools.findIndex((t) => t.nodeId === depId);
        return depIdx > idx;
      });
      return { ...tool, dependencyNames: deps, hasCycle, idx };
    });
  }, [selectedTools]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-6xl max-h-[85vh] overflow-hidden animate-fadeInUp flex flex-col rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-secondary">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {isEditing ? '编辑工作流' : '新建工作流'}
            </h3>
            <p className="text-sm text-text-tertiary mt-1">
              {isEditing
                ? '修改工作流配置，可调整工具顺序、设置依赖、并行分组和绑定提示词模板'
                : '创建一个新的自动化工作流，可组合工具、设置依赖、绑定提示词模板'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-bg-tertiary/50 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 border-b border-border-secondary bg-bg-tertiary/20">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-text-secondary font-medium mb-1.5 block">
                工作流名称
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：博客文章生成流水线"
                className="w-full h-10 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary text-sm placeholder-text-tertiary focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-text-secondary font-medium mb-1.5 block">
                工作流描述
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="描述这个工作流的用途和适用场景..."
                className="w-full h-10 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary text-sm placeholder-text-tertiary focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <div className="w-full lg:w-[38%] p-5 border-b lg:border-b-0 lg:border-r border-border-secondary overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-accent-primary" />
              <h4 className="font-medium text-text-primary">可选工具</h4>
              <span className="text-xs text-text-tertiary">({tools.length})</span>
            </div>
            <div className="space-y-2">
              {tools.map((tool) => {
                const IconComponent = getIconByName(tool.icon) || Wrench;
                const selected = isToolSelected(tool.id);
                return (
                  <div
                    key={tool.id}
                    onClick={() => !selected && handleAddTool(tool)}
                    className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      selected
                        ? 'bg-accent-primary/10 border-accent-primary/30 cursor-not-allowed opacity-60'
                        : 'bg-bg-tertiary/30 border-border-secondary hover:border-accent-primary/30 hover:bg-bg-tertiary/50 cursor-pointer'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`,
                      }}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{tool.name}</p>
                      <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">
                        {tool.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tool.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-[10px] rounded-md bg-bg-tertiary/80 text-text-secondary border border-border-secondary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {selected ? (
                      <span className="text-xs text-accent-primary flex-shrink-0 pt-2">已添加</span>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-accent-primary/20 text-accent-primary flex items-center justify-center flex-shrink-0 mt-1">
                        <Plus className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-[62%] p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-accent-secondary" />
                <h4 className="font-medium text-text-primary">流程步骤</h4>
                <span className="text-xs text-text-tertiary">
                  ({selectedTools.length} 步)
                </span>
              </div>
              {selectedTools.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-text-tertiary">
                  <Layers className="w-3 h-3" />
                  拖拽或使用箭头调整顺序
                </div>
              )}
            </div>

            {selectedTools.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-bg-tertiary/30 border border-border-secondary border-dashed">
                <div className="w-16 h-16 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="w-8 h-8 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  还没有添加步骤
                </h3>
                <p className="text-sm text-text-tertiary">
                  从左侧选择工具添加到工作流中
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dependencyInfo.map((tool, index) => {
                  const IconComponent = getIconByName(tool.icon) || Wrench;
                  const isExpanded = expandedStep === index;
                  const boundPrompt = prompts.find((p) => p.id === tool.promptId);

                  return (
                    <div
                      key={tool.nodeId}
                      className={`rounded-xl border overflow-hidden transition-all ${
                        tool.hasCycle
                          ? 'border-accent-danger/50 bg-accent-danger/5'
                          : 'border-border-secondary bg-bg-tertiary/30'
                      }`}
                    >
                      <div
                        className="p-3 flex items-center gap-3 cursor-pointer hover:bg-bg-tertiary/50 transition-all"
                        onClick={() => toggleExpandStep(index)}
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 shadow-md">
                          {index + 1}
                        </div>
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`,
                          }}
                        >
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {tool.name}
                            </p>
                            {tool.branchGroup && (
                              <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30">
                                {BRANCH_GROUPS.find((g) => g.id === tool.branchGroup)?.name ||
                                  '并行组'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {tool.dependencyNames.length > 0 ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
                                <Link2 className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">
                                  依赖: {tool.dependencyNames.join('、')}
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30">
                                <ArrowRight className="w-3 h-3" />
                                起始步骤
                              </span>
                            )}
                            {tool.hasCycle && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-accent-danger/20 text-accent-danger border border-accent-danger/30">
                                ⚠️ 循环依赖
                              </span>
                            )}
                            {tool.promptId ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-accent-warning/20 text-accent-warning border border-accent-warning/30">
                                <FileText className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">
                                  {tool.promptTitle || boundPrompt?.title}
                                </span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-text-tertiary">未绑定提示词</span>
                            )}
                          </div>
                        </div>
                        <ChevronDownIcon
                          className={`w-4 h-4 text-text-tertiary flex-shrink-0 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                              index === 0
                                ? 'text-text-tertiary cursor-not-allowed opacity-40'
                                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                            }`}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === selectedTools.length - 1}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                              index === selectedTools.length - 1
                                ? 'text-text-tertiary cursor-not-allowed opacity-40'
                                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                            }`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveTool(index)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 transition-all ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-4 pt-2 border-t border-border-secondary bg-bg-tertiary/20 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-text-secondary font-medium mb-1.5">
                                工具说明
                              </p>
                              <p className="text-xs text-text-tertiary leading-relaxed">
                                {tool.description}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-text-secondary font-medium mb-1.5">
                                适合岗位
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {tool.suitableRoles.map((role) => (
                                  <span
                                    key={role}
                                    className="px-2 py-0.5 text-[10px] rounded-md bg-bg-tertiary/80 text-text-secondary border border-border-secondary"
                                  >
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {index > 0 && (
                            <div>
                              <label className="text-xs text-text-secondary font-medium mb-1.5 block flex items-center gap-1.5">
                                <Link2 className="w-3 h-3 text-accent-primary" />
                                依赖步骤
                                <span className="text-[10px] text-text-tertiary font-normal">
                                  （必须完成后才能执行当前步骤）
                                </span>
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedTools.slice(0, index).map((prevTool) => {
                                  const isDep = tool.dependsOn.includes(prevTool.nodeId);
                                  return (
                                    <button
                                      key={prevTool.nodeId}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleDependency(index, prevTool.nodeId);
                                      }}
                                      className={`px-2.5 py-1.5 text-[11px] rounded-lg border transition-all flex items-center gap-1.5 ${
                                        isDep
                                          ? 'bg-accent-primary/20 border-accent-primary/30 text-accent-primary'
                                          : 'bg-bg-tertiary/50 border-border-secondary text-text-secondary hover:border-border-hover'
                                      }`}
                                    >
                                      {isDep && <CheckCircle2 className="w-3 h-3" />}
                                      {prevTool.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="text-xs text-text-secondary font-medium mb-1.5 block flex items-center gap-1.5">
                              <Layers className="w-3 h-3 text-accent-secondary" />
                              并行分组
                              <span className="text-[10px] text-text-tertiary font-normal">
                                （同组无依赖的步骤可并行执行）
                              </span>
                            </label>
                            <select
                              value={tool.branchGroup || 'none'}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSetBranchGroup(index, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full h-9 px-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary text-xs focus:outline-none focus:border-accent-primary/50 transition-all appearance-none pr-8 cursor-pointer"
                            >
                              {BRANCH_GROUPS.map((g) => (
                                <option key={g.id} value={g.id}>
                                  {g.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs text-text-secondary font-medium mb-1.5 block flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-accent-warning" />
                              绑定提示词模板
                              <span className="text-[10px] text-text-tertiary font-normal">
                                （可选，执行时会使用此模板内容）
                              </span>
                            </label>
                            <select
                              value={tool.promptId || ''}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleBindPrompt(
                                  index,
                                  e.target.value ? e.target.value : null
                                );
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full h-9 px-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary text-xs focus:outline-none focus:border-accent-primary/50 transition-all appearance-none pr-8 cursor-pointer"
                            >
                              <option value="">不绑定模板（使用输入内容）</option>
                              {prompts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.title} ({p.category})
                                </option>
                              ))}
                            </select>
                            {boundPrompt && (
                              <div className="mt-2 p-2.5 rounded-lg bg-accent-warning/10 border border-accent-warning/20">
                                <p className="text-[10px] text-accent-warning font-medium mb-1 flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {boundPrompt.title}
                                </p>
                                {boundPrompt.variables.length > 0 && (
                                  <p className="text-[10px] text-text-tertiary mb-1">
                                    模板变量: {boundPrompt.variables.join('、')}
                                  </p>
                                )}
                                <p className="text-[10px] text-text-tertiary line-clamp-2 whitespace-pre-wrap">
                                  {boundPrompt.content}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-border-secondary bg-bg-secondary/30">
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || selectedTools.length === 0 || showSuccess}
            className={`h-10 px-5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
              !name.trim() || selectedTools.length === 0 || showSuccess
                ? 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                : 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:shadow-glow glow-btn'
            }`}
          >
            {showSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                已保存
              </>
            ) : (
              <>
                {isEditing ? '保存修改' : '创建工作流'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
