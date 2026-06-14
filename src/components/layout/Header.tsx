import { Search, Bell, Settings, Plus } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function Header({ title, subtitle, actionLabel, onAction }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-bg-secondary/80 backdrop-blur-xl border-b border-border-primary flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-xs text-text-tertiary">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`relative transition-all duration-300 ${
            searchFocused ? 'w-80' : 'w-64'
          }`}
        >
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
              searchFocused ? 'text-accent-primary' : 'text-text-tertiary'
            }`}
          />
          <input
            type="text"
            placeholder="搜索工具、提示词..."
            className="w-full h-9 pl-10 pr-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <button className="w-9 h-9 rounded-xl bg-bg-tertiary/50 border border-border-secondary flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-hover transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-danger rounded-full" />
        </button>

        <button className="w-9 h-9 rounded-xl bg-bg-tertiary/50 border border-border-secondary flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-hover transition-all">
          <Settings className="w-4 h-4" />
        </button>

        {actionLabel && (
          <button
            onClick={onAction}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 hover:shadow-glow hover:scale-[1.02] transition-all glow-btn"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </button>
        )}
      </div>
    </header>
  );
}
