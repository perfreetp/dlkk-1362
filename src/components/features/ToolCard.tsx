import { Star, StarOff, Zap, Award, Clock, Wrench } from 'lucide-react';
import { Tool } from '@/types';
import { getIconByName } from '@/utils/iconHelper';

interface ToolCardProps {
  tool: Tool;
  onToggleFavorite?: (id: string) => void;
  onClick?: () => void;
}

export function ToolCard({ tool, onToggleFavorite, onClick }: ToolCardProps) {
  const IconComponent = getIconByName(tool.icon) || Wrench;

  const quotaPercent = ((tool.quota.used / tool.quota.total) * 100).toFixed(0);
  const isLowQuota = parseInt(quotaPercent) > 80;

  return (
    <div
      className="glass-card p-5 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300"
          style={{
            background: `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`,
          }}
        >
          <IconComponent className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-text-primary truncate">{tool.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(tool.id);
              }}
              className="flex-shrink-0 text-text-tertiary hover:text-accent-warning transition-colors"
            >
              {tool.isFavorite ? (
                <Star className="w-4 h-4 fill-accent-warning text-accent-warning" />
              ) : (
                <StarOff className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-sm text-text-tertiary mt-1 line-clamp-2">{tool.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {tool.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs rounded-md bg-bg-tertiary/80 text-text-secondary border border-border-secondary"
          >
            {tag}
          </span>
        ))}
        {tool.isTeamRecommended && (
          <span className="px-2 py-0.5 text-xs rounded-md bg-accent-primary/20 text-accent-primary border border-accent-primary/30 flex items-center gap-1">
            <Award className="w-3 h-3" />
            团队推荐
          </span>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border-secondary">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-text-tertiary flex items-center gap-1">
            <Zap className="w-3 h-3" />
            额度使用
          </span>
          <span className={`font-medium ${isLowQuota ? 'text-accent-warning' : 'text-accent-secondary'}`}>
            {quotaPercent}%
          </span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLowQuota
                ? 'bg-gradient-to-r from-accent-warning to-accent-danger'
                : 'bg-gradient-to-r from-accent-primary to-accent-secondary'
            }`}
            style={{ width: `${quotaPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-text-tertiary">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            到期：{tool.expiryDate}
          </span>
          <span>{tool.quota.used.toLocaleString()} / {tool.quota.total.toLocaleString()} {tool.quota.unit}</span>
        </div>
      </div>
    </div>
  );
}
