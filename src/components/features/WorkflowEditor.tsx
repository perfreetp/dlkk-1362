import { useState, useEffect } from 'react';
import { X, Plus, ChevronUp, ChevronDown, Trash2, Wrench, ArrowRight } from 'lucide-react';
import { Workflow, Tool } from '@/types';
import { tools } from '@/data/tools';
import { useTeamStore } from '@/store/useTeamStore';
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
}

export function WorkflowEditor({ isOpen, onClose, workflow }: WorkflowEditorProps) {
  const { addWorkflow, updateWorkflow } = useTeamStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTools, setSelectedTools] = useState<SelectedTool[]>([]);

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
            };
          }
          return null;
        })
        .filter(Boolean) as SelectedTool[];
      setSelectedTools(toolsFromNodes);
    } else {
      setName('');
      setDescription('');
      setSelectedTools([]);
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
        },
      ]);
    }
  };

  const handleRemoveTool = (index: number) => {
    setSelectedTools(selectedTools.filter((_, i) => i !== index));
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

  const handleSave = () => {
    if (!name.trim() || selectedTools.length === 0) return;

    const nodes = selectedTools.map((tool, index) => ({
      id: `n${index + 1}`,
      type: 'tool' as const,
      position: { x: 350 + index * 250, y: 100 },
      data: {
        label: tool.name,
        toolId: tool.toolId,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card w-full max-w-5xl max-h-[85vh] overflow-hidden animate-fadeInUp flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border-secondary">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {isEditing ? '编辑工作流' : '新建工作流'}
            </h3>
            <p className="text-sm text-text-tertiary mt-1">
              {isEditing ? '修改工作流配置' : '创建一个新的自动化工作流'}
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
          <div className="w-full lg:w-1/2 p-5 border-b lg:border-b-0 lg:border-r border-border-secondary overflow-y-auto">
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
                    className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
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
                      <p className="text-xs text-text-tertiary truncate">{tool.description}</p>
                    </div>
                    {selected ? (
                      <span className="text-xs text-accent-primary">已添加</span>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-accent-primary/20 text-accent-primary flex items-center justify-center flex-shrink-0">
                        <Plus className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-5 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">工作流名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入工作流名称..."
                  className="w-full h-10 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                />
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">工作流描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述这个工作流的用途..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm resize-none focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                />
              </div>

              <div>
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
                  <div className="p-8 rounded-xl bg-bg-tertiary/30 border border-border-secondary border-dashed text-center">
                    <Wrench className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                    <p className="text-sm text-text-tertiary">
                      从左侧选择工具添加到工作流
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedTools.map((tool, index) => {
                      const IconComponent = getIconByName(tool.icon) || Wrench;
                      return (
                        <div
                          key={`${tool.toolId}-${index}`}
                          className="p-3 rounded-xl bg-bg-tertiary/30 border border-border-secondary flex items-center gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary text-xs font-medium flex items-center justify-center flex-shrink-0">
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
                          </div>
                          <div className="flex items-center gap-1">
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
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-border-secondary">
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
                : 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:shadow-glow'
            }`}
          >
            {isEditing ? '保存修改' : '创建工作流'}
          </button>
        </div>
      </div>
    </div>
  );
}
