import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Workflow, Tool, Prompt } from '@/types';
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
  toolId: string;
  name: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  description: string;
  suitableRoles: string[];
  promptId?: string;
  promptTitle?: string;
}

export function WorkflowEditor({ isOpen, onClose, workflow }: WorkflowEditorProps) {
  const { addWorkflow, updateWorkflow } = useTeamStore();
  const { prompts } = usePromptStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTools, setSelectedTools] = useState<SelectedTool[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const isEditing = !!workflow;

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description);
      const toolNodes = workflow.nodes.filter((node) => node.data.toolId);
      const toolsFromNodes = toolNodes
        .sort((a, b) => a.position.y - b.position.y)
        .map((node) => {
          const tool = tools.find((t) => t.id === node.data.toolId);
          if (tool) {
            return {
              toolId: tool.id,
              name: tool.name,
              icon: tool.icon,
              gradientFrom: tool.gradientFrom,
              gradientTo: tool.gradientTo,
              description: tool.description,
              suitableRoles: tool.suitableRoles,
              promptId: node.data.promptId,
              promptTitle: node.data.promptTitle,
            };
          }
          return null;
        })
        .filter(Boolean) as SelectedTool[];
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
          toolId: tool.id,
          name: tool.name,
          icon: tool.icon,
          gradientFrom: tool.gradientFrom,
          gradientTo: tool.gradientTo,
          description: tool.description,
          suitableRoles: tool.suitableRoles,
        },
      ]);
    }
  };

  const handleRemoveTool = (index: number) => {
    setSelectedTools(selectedTools.filter((_, i) => i !== index));
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
      setSelectedTools(newTools);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < selectedTools.length - 1) {
      const newTools = [...selectedTools];
      [newTools[index + 1], newTools[index]] = [newTools[index], newTools[index + 1]];
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

  const toggleExpandStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  const handleSave = () => {
    if (!name.trim() || selectedTools.length === 0) return;

    const nodes = selectedTools.map((tool, index) => ({
      id: `n${index + 1}`,
      type: 'tool' as const,
      position: { x: 350 + index * 250, y: 100 },
      data: {
        label: tool.name,
        toolId: tool.toolId,
        promptId: tool.promptId,
        promptTitle: tool.promptTitle,
      },
    }));

    const inputNode = {
      id: 'n0',
      type: 'input' as const,
      position: { x: 100, y: 100 },
      data: { label: '输入' },
    };

    const outputNode = {
      id: `n${selectedTools.length + 1}`,
      type: 'output' as const,
      position: { x: 350 + selectedTools.length * 250, y: 100 },
      data: { label: '输出' },
    };

    const allNodes = [inputNode, ...nodes, outputNode];

    const edges = allNodes.slice(0, -1).map((node, index) => ({
      id: `e${index}`,
      source: node.id,
      target: allNodes[index + 1].id,
    }));

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

    onClose();
  };

  const isToolSelected = (toolId: string) => {
    return selectedTools.some((t) => t.toolId === toolId);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-6xl max-h-[85vh] overflow-hidden animate-fadeInUp flex flex-col rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-secondary">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {isEditing ? '编辑工作流' : '新建工作流'}
            </h3>
            <p className="text-sm text-text-tertiary mt-1">
              {isEditing ? '修改工作流配置，可调整工具顺序和绑定提示词模板' : '创建一个新的自动化工作流，可组合工具并绑定提示词模板'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-bg-tertiary/50 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
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
                      <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">{tool.description}</p>
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm text-text-secondary mb-2 block">工作流名称</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="如：博客文章生成流水线"
                    className="w-full h-10 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary mb-2 block">工作流描述</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="描述这个工作流的用途和适用场景..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm resize-none focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-accent-secondary" />
                    <h4 className="font-medium text-text-primary">流程步骤</h4>
                  </div>
                  <span className="text-xs text-text-tertiary">
                    {selectedTools.length} 个工具
                  </span>
                </div>

                {selectedTools.length === 0 ? (
                  <div className="p-10 rounded-xl bg-bg-tertiary/30 border border-border-secondary border-dashed text-center">
                    <div className="w-14 h-14 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center mx-auto mb-3">
                      <Wrench className="w-7 h-7 text-text-tertiary" />
                    </div>
                    <p className="text-sm font-medium text-text-secondary mb-1">
                      工作流还是空的
                    </p>
                    <p className="text-xs text-text-tertiary">
                      从左侧选择工具添加到工作流中，按顺序串联起来
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTools.map((tool, index) => {
                      const IconComponent = getIconByName(tool.icon) || Wrench;
                      const isExpanded = expandedStep === index;
                      const boundPrompt = prompts.find((p) => p.id === tool.promptId);
                      return (
                        <div
                          key={`${tool.toolId}-${index}`}
                          className="rounded-xl bg-bg-tertiary/30 border border-border-secondary overflow-hidden"
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
                              <p className="text-sm font-medium text-text-primary truncate">
                                {tool.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {tool.promptId ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md bg-accent-warning/20 text-accent-warning border border-accent-warning/30">
                                    <FileText className="w-3 h-3" />
                                    <span className="truncate max-w-[150px]">
                                      {tool.promptTitle || boundPrompt?.title}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-text-tertiary">
                                    未绑定提示词
                                  </span>
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
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 pt-0 mt-2 border-t border-border-secondary/60 bg-bg-primary/30">
                              <div className="pt-3 space-y-3">
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
                                    onChange={(e) =>
                                      handleBindPrompt(
                                        index,
                                        e.target.value ? e.target.value : null
                                      )
                                    }
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
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
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
            disabled={!name.trim() || selectedTools.length === 0}
            className={`h-10 px-5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
              !name.trim() || selectedTools.length === 0
                ? 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                : 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:shadow-glow glow-btn'
            }`}
          >
            {isEditing ? '保存修改' : '创建工作流'}
          </button>
        </div>
      </div>
    </div>
  );
}
