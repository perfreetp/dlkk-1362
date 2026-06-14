import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useToolStore } from '@/store/useToolStore';
import { roles, categories } from '@/data/tools';
import {
  ArrowLeft,
  Star,
  StarOff,
  Zap,
  Clock,
  Award,
  UserCheck,
  Play,
  Heart,
  TrendingUp,
  Calendar,
  Tag,
} from 'lucide-react';
import { getIconByName } from '@/utils/iconHelper';

export function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tools, toggleFavorite, setSelectedTool } = useToolStore();

  const tool = tools.find((t) => t.id === id);

  if (!tool) {
    return (
      <div className="min-h-screen bg-bg-primary grid-bg">
        <Header title="工具详情" subtitle="工具不存在" />
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-text-secondary mb-4">找不到该工具</p>
            <button
              onClick={() => navigate('/tools')}
              className="px-6 py-2 rounded-xl bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors"
            >
              返回工具广场
            </button>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = getIconByName(tool.icon);
  const quotaPercent = ((tool.quota.used / tool.quota.total) * 100).toFixed(0);
  const isLowQuota = parseInt(quotaPercent) > 80;
  const suitableRolesList = roles.filter((r) => tool.suitableRoles.includes(r.id));
  const categoryInfo = categories.find((c) => c.id === tool.category);

  const handleAddToFavorites = () => {
    toggleFavorite(tool.id);
  };

  const handleStartUsing = () => {
    setSelectedTool(tool.id);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg-primary grid-bg">
      <Header
        title="工具详情"
        subtitle={tool.name}
        actionLabel="返回列表"
        actionIcon={ArrowLeft}
        onAction={() => navigate('/tools')}
      />

      <div className="p-6">
        <button
          onClick={() => navigate('/tools')}
          className="flex items-center gap-2 text-text-tertiary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回工具广场</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`,
                  }}
                >
                  <IconComponent className="w-10 h-10 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-text-primary">{tool.name}</h1>
                      <p className="text-text-tertiary mt-1">{tool.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddToFavorites}
                        className={`p-2.5 rounded-xl border transition-all ${
                          tool.isFavorite
                            ? 'bg-accent-warning/20 border-accent-warning/30 text-accent-warning'
                            : 'bg-bg-tertiary/50 border-border-secondary text-text-tertiary hover:text-accent-warning hover:border-accent-warning/30'
                        }`}
                      >
                        {tool.isFavorite ? (
                          <Star className="w-5 h-5 fill-current" />
                        ) : (
                          <StarOff className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {categoryInfo && (
                      <span className="px-3 py-1 text-xs rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                        {categoryInfo.name}
                      </span>
                    )}
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs rounded-full bg-bg-tertiary/80 text-text-secondary border border-border-secondary"
                      >
                        #{tag}
                      </span>
                    ))}
                    {tool.isTeamRecommended && (
                      <span className="px-3 py-1 text-xs rounded-full bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        团队推荐
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-sm text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-accent-secondary" />
                      {tool.useCount.toLocaleString()} 次使用
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent-warning fill-current" />
                      {tool.rating} 分评分
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-border-secondary">
                <button
                  onClick={handleStartUsing}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-medium flex items-center justify-center gap-2 hover:shadow-glow transition-all"
                >
                  <Play className="w-5 h-5" />
                  立即使用
                </button>
                <button
                  onClick={handleAddToFavorites}
                  className={`px-6 h-12 rounded-xl border font-medium flex items-center gap-2 transition-all ${
                    tool.isFavorite
                      ? 'bg-accent-warning/20 border-accent-warning/30 text-accent-warning'
                      : 'bg-bg-tertiary/50 border-border-secondary text-text-secondary hover:border-border-hover hover:text-text-primary'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  {tool.isFavorite ? '已收藏' : '加入常用'}
                </button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-accent-primary" />
                完整介绍
              </h3>
              <div className="space-y-4 text-text-secondary">
                <p>{tool.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-bg-tertiary/30 border border-border-secondary">
                    <h4 className="font-medium text-text-primary mb-2">主要功能</h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                        智能内容生成与优化
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                        多场景模板支持
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-warning" />
                        高质量输出保证
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-success" />
                        快速响应，实时反馈
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-tertiary/30 border border-border-secondary">
                    <h4 className="font-medium text-text-primary mb-2">使用场景</h4>
                    <ul className="text-sm space-y-1">
                      {tool.tags.map((tag, index) => (
                        <li key={tag} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                          {tag}相关内容处理
                        </li>
                      ))}
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                        日常工作流集成
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-accent-primary" />
                适合岗位
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {suitableRolesList.map((role) => (
                  <div
                    key={role.id}
                    className="p-3 rounded-xl bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 border border-accent-primary/20 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">{role.name}</p>
                      <p className="text-xs text-text-tertiary">推荐使用</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent-primary" />
                额度信息
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-tertiary">已使用 / 总额度</span>
                    <span className={`font-medium ${isLowQuota ? 'text-accent-warning' : 'text-accent-secondary'}`}>
                      {tool.quota.used.toLocaleString()} / {tool.quota.total.toLocaleString()} {tool.quota.unit}
                    </span>
                  </div>
                  <div className="h-3 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLowQuota
                          ? 'bg-gradient-to-r from-accent-warning to-accent-danger'
                          : 'bg-gradient-to-r from-accent-primary to-accent-secondary'
                      }`}
                      style={{ width: `${quotaPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-text-tertiary">
                    <span>使用率 {quotaPercent}%</span>
                    <span>剩余 {(tool.quota.total - tool.quota.used).toLocaleString()} {tool.quota.unit}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-bg-tertiary/30 border border-border-secondary">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-secondary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">到期时间</p>
                      <p className="font-medium text-text-primary">{tool.expiryDate}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-bg-tertiary/30 border border-border-secondary">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary">累计使用</p>
                      <p className="font-medium text-text-primary">{tool.useCount.toLocaleString()} 次</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">快捷操作</h3>
              <div className="space-y-2">
                <button
                  onClick={handleStartUsing}
                  className="w-full h-11 rounded-xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20 flex items-center justify-center gap-2 hover:bg-accent-primary/20 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  开始使用
                </button>
                <button
                  onClick={handleAddToFavorites}
                  className={`w-full h-11 rounded-xl border flex items-center justify-center gap-2 transition-colors ${
                    tool.isFavorite
                      ? 'bg-accent-warning/10 text-accent-warning border-accent-warning/20'
                      : 'bg-bg-tertiary/50 text-text-secondary border-border-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  {tool.isFavorite ? (
                    <>
                      <Star className="w-4 h-4 fill-current" />
                      取消收藏
                    </>
                  ) : (
                    <>
                      <StarOff className="w-4 h-4" />
                      加入常用工具
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full h-11 rounded-xl bg-bg-tertiary/50 text-text-secondary border border-border-secondary flex items-center justify-center gap-2 hover:bg-bg-tertiary transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  前往工作台
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
