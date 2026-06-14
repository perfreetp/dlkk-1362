import { useState } from 'react';
import { useToolStore } from '@/store/useToolStore';
import { useTeamStore } from '@/store/useTeamStore';
import { usePromptStore } from '@/store/usePromptStore';
import { Header } from '@/components/layout/Header';
import { ToolCard } from '@/components/features/ToolCard';
import { StatCard } from '@/components/features/StatCard';
import { WorkflowEditor } from '@/components/features/WorkflowEditor';
import {
  Sparkles,
  Clock,
  Zap,
  BookmarkPlus,
  Play,
  ChevronRight,
  Layers,
  GitBranch,
  Wand2,
  ArrowRight,
  Plus,
  Star,
  StarOff,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  Wrench,
  ArrowRightCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getIconByName } from '@/utils/iconHelper';
import type { Workflow } from '@/types';

export function Workbench() {
  const { getFavoriteTools, toggleFavorite } = useToolStore();
  const { workflows, toggleWorkflowFavorite, deleteWorkflow } = useTeamStore();
  const { prompts } = usePromptStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'quick' | 'workflow'>('quick');
  const [showWorkflowEditor, setShowWorkflowEditor] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [showWorkflowDetail, setShowWorkflowDetail] = useState<Workflow | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Workflow | null>(null);

  const favoriteTools = getFavoriteTools();

  const stats = [
    { title: '今日任务', value: '12', icon: Zap, trend: '+3 较昨日', trendUp: true, gradientFrom: '#8b5cf6', gradientTo: '#06b6d4' },
    { title: '常用工具', value: '5', icon: BookmarkPlus, trend: '已收藏', trendUp: true, gradientFrom: '#ec4899', gradientTo: '#8b5cf6' },
    { title: '本月节省', value: '32h', icon: Clock, trend: '+15% 效率提升', trendUp: true, gradientFrom: '#10b981', gradientTo: '#06b6d4' },
    { title: '提示词模板', value: '8', icon: Sparkles, trend: '5 个团队共享', trendUp: true, gradientFrom: '#f59e0b', gradientTo: '#ef4444' },
  ];

  const handleCreateWorkflow = () => {
    setEditingWorkflow(null);
    setShowWorkflowEditor(true);
  };

  const handleEditWorkflow = (wf: Workflow) => {
    setEditingWorkflow(wf);
    setShowWorkflowEditor(true);
  };

  const handleDeleteWorkflow = (wf: Workflow) => {
    setShowDeleteConfirm(wf);
  };

  const handleConfirmDelete = () => {
    if (showDeleteConfirm) {
      deleteWorkflow(showDeleteConfirm.id);
      if (showWorkflowDetail?.id === showDeleteConfirm.id) {
        setShowWorkflowDetail(null);
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleUseWorkflow = (wf: Workflow) => {
    setShowWorkflowDetail(wf);
  };

  const getToolById = (toolId: string) => {
    return getFavoriteTools().find((t) => t.id === toolId);
  };

  return (
    <div className="min-h-screen bg-bg-primary aurora-bg">
      <Header
        title="工作台"
        subtitle="开始你的 AI 创作之旅"
        actionLabel="新建任务"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={stat.title} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('quick')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'quick'
                        ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/10 text-white border border-accent-primary/30'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      快捷工具
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('workflow')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'workflow'
                        ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/10 text-white border border-accent-primary/30'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      工作流
                    </span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === 'workflow' && (
                    <button
                      onClick={handleCreateWorkflow}
                      className="text-sm text-accent-primary hover:text-accent-secondary flex items-center gap-1 transition-colors mr-2"
                    >
                      <Plus className="w-4 h-4" />
                      新建工作流
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/tools')}
                    className="text-sm text-accent-primary hover:text-accent-secondary flex items-center gap-1 transition-colors"
                  >
                    查看全部
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {activeTab === 'quick' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favoriteTools.slice(0, 4).map((tool, index) => (
                    <div
                      key={tool.id}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ToolCard
                        tool={tool}
                        onToggleFavorite={toggleFavorite}
                        onClick={() => navigate(`/tools/${tool.id}`)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'workflow' && (
                <div className="space-y-3">
                  {workflows.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center mx-auto mb-4">
                        <GitBranch className="w-8 h-8 text-text-tertiary" />
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        还没有工作流
                      </h3>
                      <p className="text-sm text-text-tertiary mb-4">
                        创建你的第一个工作流，将多个工具串联起来
                      </p>
                      <button
                        onClick={handleCreateWorkflow}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 mx-auto hover:shadow-glow transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        创建工作流
                      </button>
                    </div>
                  ) : (
                    workflows.map((wf, index) => (
                      <div
                        key={wf.id}
                        className="glass-card p-4 cursor-pointer hover:border-accent-primary/40 transition-all animate-fadeInUp group"
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => handleUseWorkflow(wf)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-secondary/20 flex items-center justify-center">
                            <Layers className="w-6 h-6 text-accent-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-text-primary">{wf.name}</h4>
                            <p className="text-sm text-text-tertiary">{wf.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-text-tertiary">
                              <span className="flex items-center gap-1">
                                <Play className="w-3 h-3" />
                                {wf.nodes.filter((n) => n.type === 'tool').length} 个工具
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                使用 {wf.useCount} 次
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWorkflowFavorite(wf.id);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-warning hover:bg-accent-warning/10 transition-all"
                            >
                              {wf.isFavorite ? (
                                <Star className="w-4 h-4 fill-current text-accent-warning" />
                              ) : (
                                <StarOff className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditWorkflow(wf);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWorkflow(wf);
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUseWorkflow(wf);
                            }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center text-white hover:shadow-glow hover:scale-105 transition-all"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-accent-primary" />
                  快速执行
                </h3>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <textarea
                    placeholder="输入你的需求，我来帮你选择最合适的工具..."
                    className="w-full h-32 p-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm resize-none focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-tertiary">常用模板：</span>
                  {prompts.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      className="px-3 py-1 text-xs rounded-lg bg-bg-tertiary/80 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-border-secondary transition-all"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
                <button className="h-10 px-6 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 hover:shadow-glow hover:scale-[1.02] transition-all glow-btn">
                  <Sparkles className="w-4 h-4" />
                  开始生成
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-5">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-secondary" />
                最近使用
              </h3>
              <div className="space-y-3">
                {favoriteTools.slice(0, 3).map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-tertiary/50 cursor-pointer transition-all"
                    onClick={() => navigate(`/tools/${tool.id}`)}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`,
                      }}
                    >
                      <span className="text-white text-sm">✨</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{tool.name}</p>
                      <p className="text-xs text-text-tertiary">2 小时前使用</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-tertiary" />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-accent-warning" />
                团队推荐
              </h3>
              <div className="space-y-2">
                {favoriteTools.filter((t) => t.isTeamRecommended).slice(0, 3).map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-tertiary/50 cursor-pointer transition-all"
                    onClick={() => navigate(`/tools/${tool.id}`)}
                  >
                    <span className="text-sm text-text-secondary">{tool.name}</span>
                    <span className="text-xs text-accent-primary">推荐</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 border-accent-primary/20">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mb-3">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-text-primary mb-1">创建你的工作流</h4>
                <p className="text-sm text-text-tertiary mb-4">
                  组合多个 AI 工具，一键完成复杂任务
                </p>
                <button
                  onClick={handleCreateWorkflow}
                  className="w-full h-9 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  新建工作流
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWorkflowEditor && (
        <WorkflowEditor
          isOpen={showWorkflowEditor}
          onClose={() => {
            setShowWorkflowEditor(false);
            setEditingWorkflow(null);
          }}
          workflow={editingWorkflow || undefined}
        />
      )}

      {showWorkflowDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-4xl max-h-[85vh] overflow-hidden animate-fadeInUp flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-secondary">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {showWorkflowDetail.name}
                </h3>
                <p className="text-sm text-text-tertiary mt-1">
                  {showWorkflowDetail.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleEditWorkflow(showWorkflowDetail);
                    setShowWorkflowDetail(null);
                  }}
                  className="p-2 rounded-lg bg-bg-tertiary/50 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowWorkflowDetail(null)}
                  className="w-8 h-8 rounded-lg bg-bg-tertiary/50 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-accent-primary" />
                  流程步骤
                </h4>
                <div className="flex items-center gap-2 overflow-x-auto pb-4">
                  {showWorkflowDetail.nodes
                    .filter((node) => node.type !== 'input' && node.type !== 'output')
                    .sort((a, b) => a.position.x - b.position.x)
                    .map((node, index, arr) => {
                      const tool = getToolById(node.data.toolId || '');
                      const IconComponent = tool ? getIconByName(tool.icon) || Wrench : Wrench;

                      return (
                        <div key={node.id} className="flex items-center gap-2 flex-shrink-0">
                          <div className="p-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary min-w-[140px]">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: tool
                                    ? `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`
                                    : 'linear-gradient(135deg, #667eea, #764ba2)',
                                }}
                              >
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <span className="text-xs font-medium text-text-primary">
                                  步骤 {index + 1}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-text-primary truncate">
                              {node.data.label}
                            </p>
                          </div>
                          {index < arr.length - 1 && (
                            <ArrowRightCircle className="w-5 h-5 text-accent-primary flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-text-primary mb-3">包含的工具</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {showWorkflowDetail.nodes
                    .filter((node) => node.type === 'tool')
                    .map((node) => {
                      const tool = getToolById(node.data.toolId || '');
                      const IconComponent = tool ? getIconByName(tool.icon) || Wrench : Wrench;

                      return (
                        <div
                          key={node.id}
                          className="p-3 rounded-xl bg-bg-tertiary/30 border border-border-secondary flex items-center gap-3"
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: tool
                                ? `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`
                                : 'linear-gradient(135deg, #667eea, #764ba2)',
                            }}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {node.data.label}
                            </p>
                            {tool && (
                              <p className="text-xs text-text-tertiary truncate">
                                {tool.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/20">
                <h4 className="text-sm font-medium text-text-primary mb-2">开始使用</h4>
                <p className="text-sm text-text-tertiary mb-4">
                  点击下方按钮，输入内容后将按顺序执行工作流中的所有工具
                </p>
                <textarea
                  placeholder="输入要处理的内容..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm resize-none focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all mb-4"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowWorkflowDetail(null)}
                    className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
                  >
                    取消
                  </button>
                  <button className="h-10 px-5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 hover:shadow-glow transition-all">
                    <Play className="w-4 h-4" />
                    执行工作流
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-md overflow-hidden animate-fadeInUp">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-accent-danger/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-accent-danger" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                确认删除工作流
              </h3>
              <p className="text-sm text-text-tertiary mb-6">
                确定要删除「{showDeleteConfirm.name}」吗？此操作不可撤销。
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="h-10 px-5 rounded-xl bg-accent-danger text-white text-sm font-medium hover:bg-accent-danger/90 transition-all"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
