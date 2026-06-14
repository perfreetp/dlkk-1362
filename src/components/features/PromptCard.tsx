import { Star, StarOff, Users, Copy, FileCode } from 'lucide-react';
import { Prompt } from '@/types';

interface PromptCardProps {
  prompt: Prompt;
  onToggleFavorite?: (id: string) => void;
  onToggleTeamShare?: (id: string) => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export function PromptCard({
  prompt,
  onToggleFavorite,
  onToggleTeamShare,
  onClick,
  isSelected,
}: PromptCardProps) {
  return (
    <div
      className={`glass-card p-4 cursor-pointer transition-all duration-300 ${
        isSelected ? 'border-accent-primary/50 shadow-glow ring-1 ring-accent-primary/30' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary/30 to-accent-secondary/20 flex items-center justify-center flex-shrink-0">
            <FileCode className="w-4 h-4 text-accent-primary" />
          </div>
          <h3 className="font-medium text-text-primary truncate text-sm">{prompt.title}</h3>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(prompt.id);
            }}
            className="p-1.5 rounded-lg hover:bg-bg-tertiary/50 text-text-tertiary hover:text-accent-warning transition-all"
          >
            {prompt.isFavorite ? (
              <Star className="w-3.5 h-3.5 fill-accent-warning text-accent-warning" />
            ) : (
              <StarOff className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-text-tertiary mt-2 line-clamp-3 leading-relaxed">
        {prompt.content.replace(/\{[^}]+\}/g, (match) => match)}
      </p>

      {prompt.variables.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {prompt.variables.map((v) => (
            <span
              key={v}
              className="px-1.5 py-0.5 text-[10px] rounded bg-accent-primary/15 text-accent-primary font-mono"
            >
              {'{' + v + '}'}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-secondary">
        <div className="flex items-center gap-2">
          {prompt.isTeamShared && (
            <span className="flex items-center gap-1 text-xs text-accent-secondary">
              <Users className="w-3 h-3" />
              团队共享
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-text-tertiary">
          <span className="flex items-center gap-1">
            <Copy className="w-3 h-3" />
            {prompt.useCount}
          </span>
        </div>
      </div>
    </div>
  );
}
