import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Wrench,
  BookOpen,
  ClipboardList,
  Users,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutGrid, label: '工作台', end: true },
  { path: '/tools', icon: Wrench, label: '工具广场' },
  { path: '/prompts', icon: BookOpen, label: '提示词库' },
  { path: '/tasks', icon: ClipboardList, label: '任务记录' },
  { path: '/team', icon: Users, label: '团队空间' },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-bg-secondary border-r border-border-primary flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-border-primary">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">AI 工具箱</h1>
            <p className="text-xs text-text-tertiary">内容团队专属</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/10 text-white border border-accent-primary/30 shadow-glow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 hover:border-border-hover border border-transparent'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-primary">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-pink to-accent-primary flex items-center justify-center text-lg">
              👨‍💼
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">张三</p>
              <p className="text-xs text-text-tertiary">内容总监 · 管理员</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border-secondary">
            <div className="flex justify-between text-xs">
              <span className="text-text-tertiary">本月额度</span>
              <span className="text-accent-secondary font-medium">68%</span>
            </div>
            <div className="mt-2 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full progress-bar"
                style={{ width: '68%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
