import { Star, StarOff, Bookmark, BookmarkCheck, Clock, Zap, User, Wrench } from 'lucide-react';
import { TaskRecord } from '@/types';
import { getIconByName } from '@/utils/iconHelper';

interface TaskRecordCardProps {
  record: TaskRecord;
  onToggleFavorite?: (id: string) => void;
  onSetRating?: (id: string, rating: number) => void;
  onClick?: () => void;
}

export function TaskRecordCard({
  record,
  onToggleFavorite,
  onSetRating,
  onClick,
}: TaskRecordCardProps) {
  const IconComponent = getIconByName(record.toolIcon) || Wrench;

  return (
    <div
      className="glass-card p-4 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${record.gradientFrom}, ${record.gradientTo})`,
          }}
        >
          <IconComponent className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-text-primary text-sm">{record.toolName}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(record.id);
              }}
              className="text-text-tertiary hover:text-accent-warning transition-colors"
            >
              {record.isFavorite ? (
                <BookmarkCheck className="w-4 h-4 fill-accent-warning text-accent-warning" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>

          {record.promptTitle && (
            <p className="text-xs text-accent-primary mt-0.5">
              模板：{record.promptTitle}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 p-3 bg-bg-tertiary/50 rounded-lg border border-border-secondary">
        <p className="text-xs text-text-secondary line-clamp-2">{record.input}</p>
        <div className="mt-2 pt-2 border-t border-border-secondary border-dashed">
          <p className="text-xs text-text-tertiary line-clamp-2">{record.output}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onSetRating?.(record.id, star)}
              className="hover:scale-110 transition-transform"
            >
              {star <= record.rating ? (
                <Star className="w-3.5 h-3.5 fill-accent-warning text-accent-warning" />
              ) : (
                <Star className="w-3.5 h-3.5 text-text-tertiary" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-text-tertiary">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {record.duration}s
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {record.quotaUsed}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {record.createdBy}
          </span>
        </div>
      </div>

      <div className="mt-2 text-[11px] text-text-tertiary">
        {record.createdAt}
      </div>
    </div>
  );
}
