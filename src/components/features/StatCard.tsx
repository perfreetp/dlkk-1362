import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  gradientFrom: string;
  gradientTo: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, gradientFrom, gradientTo }: StatCardProps) {
  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      />
      
      <div className="relative">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        
        <p className="text-sm text-text-tertiary mb-1">{title}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        
        {trend && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${trendUp ? 'text-accent-success' : 'text-accent-danger'}`}>
            <span>{trendUp ? '↑' : '↓'}</span>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
