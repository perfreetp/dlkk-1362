import { useState } from 'react';
import { useToolStore } from '@/store/useToolStore';
import { useTeamStore } from '@/store/useTeamStore';
import { usePromptStore } from '@/store/usePromptStore';
import { Header } from '@/components/layout/Header';
import { ToolCard } from '@/components/features/ToolCard';
import { StatCard } from '@/components/features/StatCard';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Workbench() {
  const { getFavoriteTools, toggleFavorite } = useToolStore();
  const { workflows, toggleWorkflowFavorite } = useTeamStore();
  const { prompts } = usePromptStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'quick' | 'workflow'>('quick');
  const favoriteTools = getFavoriteTools();

  const stats = [
    { title: '今日任务', value: '12', icon: Zap, trend: '+3 较昨日', trendUp: true, gradientFrom: '#8b5cf6', gradientTo: '#06b6d4' },
    { title: '常用工具', value: '5', icon: BookmarkPlus, trend: '已收藏', trendUp: true, gradientFrom: '#ec4899', gradientTo: '#8b5cf6' },
    { title: '本月节省', value: '32h', icon: Clock, trend: '+15% 效率提升', trendUp: true, gradientFrom: '#10b981', gradientTo: '#06b6d4' },
    { title: '提示词模板', value: '8', icon: Sparkles, trend: '5 个团队共享', trendUp: true, gradientFrom: '#f59e0b', gradientTo: '#ef4444' },
  ];

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
                <button
                  onClick={() => navigate('/tools')}
                  className="text-sm text-accent-primary hover:text-accent-secondary flex items-center gap-1 transition-colors"
                >
                  查看全部
                  <ChevronRight className="w-4 h-4" />
                </button>
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
                        onClick={() => console.log('Start tool:', tool.name)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'workflow' && (
                <div className="space-y-3">
                  {workflows.map((wf, index) => (
                    <div
                      key={wf.id}
                      className="glass-card p-4 cursor-pointer hover:border-accent-primary/40 transition-all animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => console.log('Open workflow:', wf.name)}
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
                              {wf.nodes.length} 个节点
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              使用 {wf.useCount} 次
                            </span>
                          </div>
                        </div>
                        <button className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center text-white hover:shadow-glow hover:scale-105 transition-all">
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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
                    onClick={() => console.log('Use tool:', tool.name)}
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
                    onClick={() => console.log('Use tool:', tool.name)}
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
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-text-primary mb-1">创建你的工作流</h4>
                <p className="text-sm text-text-tertiary mb-4">
                  组合多个 AI 工具，一键完成复杂任务
                </p>
                <button className="w-full h-9 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all border border-white/20">
                  + 新建工作流
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
