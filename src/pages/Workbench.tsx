import { useState } from 'react';
import { useToolStore } from '@/store/useToolStore';
import { useTeamStore } from '@/store/useTeamStore';
import { usePromptStore } from '@/store/usePromptStore';
import { Header } from '@/components/layout/Header';
import { ToolCard } from '@/components/features/ToolCard';
import { StatCard } from '@/components/features/StatCard';
import { WorkflowEditor } from '@/components/features/WorkflowEditor';
import { WorkflowExecutor } from '@/components/features/WorkflowExecutor';
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
  FileText,
  CheckCircle2,
  History,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getIconByName } from '@/utils/iconHelper';
import type { Workflow, WorkflowExecutionRecord } from '@/types';
import { tools as allTools } from '@/data/tools';

export function Workbench() {
  const { getFavoriteTools, toggleFavorite } = useToolStore();
  const {
    workflows,
    workflowExecutions,
    toggleWorkflowFavorite,
    deleteWorkflow,
    getWorkflowExecutions,
  } = useTeamStore();
  const { prompts } = usePromptStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'quick' | 'workflow' | 'history'>('quick');
  const [showWorkflowEditor, setShowWorkflowEditor] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [showWorkflowExecutor, setShowWorkflowExecutor] = useState(false);
  const [executingWorkflow, setExecutingWorkflow] = useState<Workflow | null>(null);
  const [viewingExecution, setViewingExecution] = useState<WorkflowExecutionRecord | null>(null);
  const [showWorkflowDetail, setShowWorkflowDetail] = useState<Workflow | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Workflow | null>(null);

  const favoriteTools = getFavoriteTools();

  const stats = [
    {
      title: '今日任务',
      value: '12',
      icon: Zap,
      trend: '+3 较昨日',
      trendUp: true,
      gradientFrom: '#8b5cf6',
      gradientTo: '#06b6d4',
    },
    {
      title: '常用工具',
      value: favoriteTools.length.toString(),
      icon: BookmarkPlus,
      trend: '已收藏',
      trendUp: true,
      gradientFrom: '#ec4899',
      gradientTo: '#8b5cf6',
    },
    {
      title: '本月节省',
      value: '32h',
      icon: Clock,
      trend: '+15% 效率提升',
      trendUp: true,
      gradientFrom: '#10b981',
      gradientTo: '#06b6d4',
    },
    {
      title: '提示词模板',
      value: prompts.length.toString(),
      icon: Sparkles,
      trend: `${prompts.filter((p) => p.isTeamShared).length} 个团队共享`,
      trendUp: true,
      gradientFrom: '#f59e0b',
      gradientTo: '#ef4444',
    },
  ];

  const handleCreateWorkflow = () => {
    setEditingWorkflow(null);
    setShowWorkflowEditor(true);
  };

  const handleEditWorkflow = (wf: Workflow) => {
    setEditingWorkflow(wf);
    setShowWorkflowDetail(null);
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

  const handleExecuteWorkflow = (wf: Workflow) => {
    setExecutingWorkflow(wf);
    setViewingExecution(null);
    setShowWorkflowExecutor(true);
  };

  const handleViewWorkflowDetail = (wf: Workflow) => {
    setShowWorkflowDetail(wf);
  };

  const handleViewExecution = (exec: WorkflowExecutionRecord) => {
    const wf = workflows.find((w) => w.id === exec.workflowId);
    if (wf) {
      setExecutingWorkflow(wf);
      setViewingExecution(exec);
      setShowWorkflowExecutor(true);
    }
  };

  const getToolById = (toolId: string) => {
    return allTools.find((t) => t.id === toolId);
  };

  const getPromptById = (promptId?: string) => {
    if (!promptId) return null;
    return prompts.find((p) => p.id === promptId);
  };

  const recentExecutions = workflowExecutions.slice(0, 10);

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
            <div
              key={stat.title}
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
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
                      {workflows.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-accent-primary/20 text-[10px]">
                          {workflows.length}
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'history'
                        ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/10 text-white border border-accent-primary/30'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      执行历史
                      {recentExecutions.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-accent-secondary/20 text-[10px]">
                          {recentExecutions.length}
                        </span>
                      )}
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
                  {favoriteTools.length === 0 && (
                    <div className="col-span-2 p-8 text-center rounded-xl bg-bg-tertiary/30 border border-border-secondary border-dashed">
                      <Wrench className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                      <p className="text-sm text-text-tertiary">
                        还没有收藏常用工具，去{' '}
                        <button
                          onClick={() => navigate('/tools')}
                          className="text-accent-primary hover:underline"
                        >
                          工具广场
                        </button>{' '}
                        添加吧
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'workflow' && (
                <div className="space-y-3">
                  {workflows.length === 0 ? (
                    <div className="p-12 text-center rounded-xl bg-bg-tertiary/30 border border-border-secondary border-dashed">
                      <div className="w-16 h-16 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center mx-auto mb-4">
                        <GitBranch className="w-8 h-8 text-text-tertiary" />
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        还没有工作流
                      </h3>
                      <p className="text-sm text-text-tertiary mb-4">
                        创建你的第一个工作流，将多个工具串联起来形成自动化流程
                      </p>
                      <button
                        onClick={handleCreateWorkflow}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 mx-auto hover:shadow-glow transition-all glow-btn"
                      >
                        <Plus className="w-4 h-4" />
                        创建工作流
                      </button>
                    </div>
                  ) : (
                    workflows.map((wf, index) => {
                      const toolNodes = wf.nodes.filter((n) => n.type === 'tool');
                      const execCount = getWorkflowExecutions(wf.id).length;
                      return (
                        <div
                          key={wf.id}
                          className="glass-card p-4 hover:border-accent-primary/40 transition-all animate-fadeInUp group"
                          style={{ animationDelay: `${index * 0.08}s` }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-secondary/20 flex items-center justify-center cursor-pointer hover:shadow-glow transition-all"
                              onClick={() => handleViewWorkflowDetail(wf)}
                            >
                              <Layers className="w-6 h-6 text-accent-primary" />
                            </div>
                            <div
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => handleViewWorkflowDetail(wf)}
                            >
                              <h4 className="font-medium text-text-primary truncate">
                                {wf.name}
                              </h4>
                              <p className="text-sm text-text-tertiary truncate">
                                {wf.description || '暂无描述'}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-text-tertiary">
                                <span className="flex items-center gap-1">
                                  <Play className="w-3 h-3" />
                                  {toolNodes.length} 个工具
                                </span>
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  执行 {wf.useCount} 次
                                </span>
                                {execCount > 0 && (
                                  <span className="flex items-center gap-1">
                                    <History className="w-3 h-3" />
                                    {execCount} 条记录
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWorkflowFavorite(wf.id);
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-warning hover:bg-accent-warning/10 transition-all"
                                title={wf.isFavorite ? '取消收藏' : '加入常用'}
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
                                title="编辑工作流"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWorkflow(wf);
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-danger hover:bg-accent-danger/10 transition-all"
                                title="删除工作流"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExecuteWorkflow(wf);
                              }}
                              className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center text-white hover:shadow-glow hover:scale-105 transition-all glow-btn"
                              title="执行工作流"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {recentExecutions.length === 0 ? (
                    <div className="p-12 text-center rounded-xl bg-bg-tertiary/30 border border-border-secondary border-dashed">
                      <div className="w-16 h-16 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-text-tertiary" />
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        暂无执行记录
                      </h3>
                      <p className="text-sm text-text-tertiary">
                        运行工作流后，执行记录将显示在这里
                      </p>
                    </div>
                  ) : (
                    recentExecutions.map((exec, idx) => {
                      const wf = workflows.find((w) => w.id === exec.workflowId);
                      const isCompleted = exec.status === 'completed';
                      const isRunning = exec.status === 'running';
                      const isError = exec.status === 'error';
                      return (
                        <div
                          key={exec.id}
                          onClick={() => handleViewExecution(exec)}
                          className="p-3 rounded-xl bg-bg-tertiary/30 border border-border-secondary hover:border-accent-primary/30 hover:bg-bg-tertiary/50 cursor-pointer transition-all animate-fadeInUp flex items-center gap-3"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-accent-secondary/20'
                                : isRunning
                                ? 'bg-accent-primary/20'
                                : isError
                                ? 'bg-accent-danger/20'
                                : 'bg-bg-tertiary/50'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-accent-secondary" />
                            ) : isRunning ? (
                              <Sparkles className="w-4 h-4 text-accent-primary animate-pulse" />
                            ) : isError ? (
                              <AlertTriangle className="w-4 h-4 text-accent-danger" />
                            ) : (
                              <Clock className="w-4 h-4 text-text-tertiary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-text-primary truncate">
                                {exec.workflowName || wf?.name || '已删除工作流'}
                              </p>
                              <span
                                className={`px-1.5 py-0.5 text-[10px] rounded-md ${
                                  isCompleted
                                    ? 'bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30'
                                    : isRunning
                                    ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                                    : isError
                                    ? 'bg-accent-danger/20 text-accent-danger border border-accent-danger/30'
                                    : 'bg-bg-tertiary/80 text-text-tertiary border border-border-secondary'
                                }`}
                              >
                                {isCompleted
                                  ? '成功'
                                  : isRunning
                                  ? '执行中'
                                  : isError
                                  ? '失败'
                                  : '待执行'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-text-tertiary">
                              <span>{exec.createdAt}</span>
                              <span className="flex items-center gap-1">
                                <Layers className="w-2.5 h-2.5" />
                                {exec.steps.length} 步
                              </span>
                              {exec.totalDuration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {(exec.totalDuration / 1000).toFixed(1)}s
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                        </div>
                      );
                    })
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
                      onClick={() => navigate('/prompts')}
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
                      {(() => {
                        const IconComp = getIconByName(tool.icon);
                        return IconComp ? (
                          <IconComp className="w-4 h-4 text-white" />
                        ) : (
                          <Wrench className="w-4 h-4 text-white" />
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{tool.name}</p>
                      <p className="text-xs text-text-tertiary truncate">
                        {tool.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-tertiary" />
                  </div>
                ))}
                {favoriteTools.length === 0 && (
                  <p className="text-sm text-text-tertiary text-center py-4">
                    暂无常用工具
                  </p>
                )}
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-accent-warning" />
                团队推荐
              </h3>
              <div className="space-y-2">
                {allTools
                  .filter((t) => t.isTeamRecommended)
                  .slice(0, 4)
                  .map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-tertiary/50 cursor-pointer transition-all"
                      onClick={() => navigate(`/tools/${tool.id}`)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`,
                          }}
                        >
                          {(() => {
                            const IconComp = getIconByName(tool.icon);
                            return IconComp ? (
                              <IconComp className="w-3.5 h-3.5 text-white" />
                            ) : (
                              <Wrench className="w-3.5 h-3.5 text-white" />
                            );
                          })()}
                        </div>
                        <span className="text-sm text-text-secondary truncate">
                          {tool.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-accent-primary px-1.5 py-0.5 rounded-md bg-accent-primary/10 flex-shrink-0">
                        推荐
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="glass-card p-5 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 border-accent-primary/20">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mb-3 shadow-lg">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-text-primary mb-1">创建你的工作流</h4>
                <p className="text-sm text-text-tertiary mb-4 leading-relaxed">
                  组合多个 AI 工具，按顺序串接
                  <br />
                  一键完成写作、翻译、整理等复杂任务
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

      {showWorkflowExecutor && executingWorkflow && (
        <WorkflowExecutor
          isOpen={showWorkflowExecutor}
          onClose={() => {
            setShowWorkflowExecutor(false);
            setExecutingWorkflow(null);
            setViewingExecution(null);
          }}
          workflow={executingWorkflow}
          existingExecution={viewingExecution}
        />
      )}

      {showWorkflowDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-4xl max-h-[85vh] overflow-hidden animate-fadeInUp flex flex-col rounded-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border-secondary">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-primary/30 to-accent-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {showWorkflowDetail.name}
                  </h3>
                  <p className="text-sm text-text-tertiary mt-0.5">
                    {showWorkflowDetail.description || '暂无描述'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {showWorkflowDetail.nodes.filter((n) => n.type === 'tool').length} 个工具
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      执行 {showWorkflowDetail.useCount} 次
                    </span>
                    {getWorkflowExecutions(showWorkflowDetail.id).length > 0 && (
                      <span className="flex items-center gap-1">
                        <History className="w-3 h-3" />
                        {getWorkflowExecutions(showWorkflowDetail.id).length} 条记录
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleExecuteWorkflow(showWorkflowDetail);
                    setShowWorkflowDetail(null);
                  }}
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-xs font-medium flex items-center gap-1.5 hover:shadow-glow transition-all glow-btn"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  执行
                </button>
                <button
                  onClick={() => handleEditWorkflow(showWorkflowDetail)}
                  className="p-2 rounded-lg bg-bg-tertiary/50 text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-all"
                  title="编辑"
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

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-accent-primary" />
                  流程步骤
                  <span className="text-[11px] text-text-tertiary font-normal">
                    （点击下方卡片可查看工具详情）
                  </span>
                </h4>
                <div className="flex items-start gap-2 overflow-x-auto pb-4">
                  {showWorkflowDetail.nodes
                    .filter((node) => node.type !== 'input' && node.type !== 'output')
                    .sort((a, b) => a.position.x - b.position.x)
                    .map((node, index, arr) => {
                      const tool = getToolById(node.data.toolId || '');
                      const prompt = getPromptById(node.data.promptId);
                      const IconComponent = tool
                        ? getIconByName(tool.icon) || Wrench
                        : Wrench;

                      return (
                        <div
                          key={node.id}
                          className="flex items-start gap-2 flex-shrink-0"
                        >
                          <div
                            onClick={() =>
                              tool && navigate(`/tools/${tool.id}`)
                            }
                            className={`p-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary min-w-[180px] max-w-[200px] ${
                              tool ? 'cursor-pointer hover:border-accent-primary/40 hover:bg-bg-tertiary/80' : ''
                            } transition-all`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                                style={{
                                  background: tool
                                    ? `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`
                                    : 'linear-gradient(135deg, #667eea, #764ba2)',
                                }}
                              >
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <span className="text-[10px] text-text-tertiary block">
                                  步骤
                                </span>
                                <span className="text-xs font-bold text-text-primary">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-text-primary truncate mb-1">
                              {node.data.label}
                            </p>
                            {tool && (
                              <>
                                <p className="text-[10px] text-text-tertiary line-clamp-2 leading-relaxed mb-1.5">
                                  {tool.description}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                  {tool.suitableRoles.slice(0, 2).map((role) => (
                                    <span
                                      key={role}
                                      className="px-1 py-0.5 text-[9px] rounded bg-bg-primary/60 text-text-tertiary border border-border-secondary"
                                    >
                                      {role}
                                    </span>
                                  ))}
                                  {tool.suitableRoles.length > 2 && (
                                    <span className="px-1 py-0.5 text-[9px] rounded bg-bg-primary/60 text-text-tertiary">
                                      +{tool.suitableRoles.length - 2}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                            {prompt ? (
                              <div className="mt-1 p-1.5 rounded-md bg-accent-warning/10 border border-accent-warning/20">
                                <p className="text-[9px] text-accent-warning font-medium flex items-center gap-1 truncate">
                                  <FileText className="w-2.5 h-2.5 flex-shrink-0" />
                                  {node.data.promptTitle || prompt.title}
                                </p>
                              </div>
                            ) : (
                              <p className="mt-1 text-[9px] text-text-tertiary px-1">
                                不使用模板
                              </p>
                            )}
                          </div>
                          {index < arr.length - 1 && (
                            <ArrowRightCircle className="w-5 h-5 text-accent-primary flex-shrink-0 mt-10" />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent-secondary" />
                  工具详细信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {showWorkflowDetail.nodes
                    .filter((node) => node.type === 'tool')
                    .map((node) => {
                      const tool = getToolById(node.data.toolId || '');
                      const prompt = getPromptById(node.data.promptId);
                      const IconComponent = tool
                        ? getIconByName(tool.icon) || Wrench
                        : Wrench;

                      return (
                        <div
                          key={node.id}
                          className="p-3 rounded-xl bg-bg-tertiary/30 border border-border-secondary"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                              style={{
                                background: tool
                                  ? `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`
                                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                              }}
                            >
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-text-primary truncate">
                                  {node.data.label}
                                </p>
                                {tool?.isTeamRecommended && (
                                  <span className="px-1.5 py-0.5 text-[9px] rounded-md bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
                                    推荐
                                  </span>
                                )}
                                {tool?.isFavorite && (
                                  <Star className="w-3 h-3 text-accent-warning fill-current flex-shrink-0" />
                                )}
                              </div>
                              {tool ? (
                                <>
                                  <p className="text-xs text-text-tertiary mt-1 leading-relaxed line-clamp-2">
                                    {tool.description}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 text-[10px] text-text-tertiary">
                                    <span>额度: {tool.quota.used.toLocaleString()}/{tool.quota.total.toLocaleString()} {tool.quota.unit}</span>
                                    <span>到期: {tool.expiryDate}</span>
                                  </div>
                                </>
                              ) : (
                                <p className="text-xs text-accent-danger mt-1">
                                  工具已移除
                                </p>
                              )}
                            </div>
                          </div>
                          {prompt && (
                            <div className="mt-3 p-2.5 rounded-lg bg-accent-warning/10 border border-accent-warning/20">
                              <p className="text-[10px] text-accent-warning font-medium mb-1 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                绑定提示词: {node.data.promptTitle || prompt.title}
                              </p>
                              {prompt.variables.length > 0 && (
                                <p className="text-[10px] text-text-tertiary mb-1">
                                  变量: {prompt.variables.join('、')}
                                </p>
                              )}
                              <p className="text-[10px] text-text-tertiary line-clamp-3 whitespace-pre-wrap leading-relaxed">
                                {prompt.content}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 border border-accent-primary/20">
                <h4 className="text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
                  <Play className="w-4 h-4 text-accent-primary fill-current" />
                  准备开始
                </h4>
                <p className="text-sm text-text-tertiary mb-4 leading-relaxed">
                  点击右上角「执行」按钮，输入原始内容后，系统将按顺序调用工作流中的每个工具；
                  若某一步绑定了提示词模板，会自动应用模板内容。
                  执行过程中可实时查看进度，每一步的输入输出都会完整保存。
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowWorkflowDetail(null)}
                    className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
                  >
                    关闭
                  </button>
                  <button
                    onClick={() => {
                      handleExecuteWorkflow(showWorkflowDetail);
                      setShowWorkflowDetail(null);
                    }}
                    className="h-10 px-5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 hover:shadow-glow transition-all glow-btn"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    立即执行
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md overflow-hidden animate-fadeInUp rounded-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-accent-danger/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-accent-danger" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                确认删除工作流
              </h3>
              <p className="text-sm text-text-tertiary mb-6 leading-relaxed">
                确定要删除「{showDeleteConfirm.name}」吗？
                <br />
                工作流本身和其执行历史都会被清除，此操作不可撤销。
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
