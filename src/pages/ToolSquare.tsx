import { useToolStore } from '@/store/useToolStore';
import { Header } from '@/components/layout/Header';
import { ToolCard } from '@/components/features/ToolCard';
import { categories, roles } from '@/data/tools';
import { Grid3X3, Briefcase, Search, SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getIconByName } from '@/utils/iconHelper';

export function ToolSquare() {
  const {
    selectedCategory,
    selectedRole,
    searchQuery,
    setSelectedCategory,
    setSelectedRole,
    setSearchQuery,
    toggleFavorite,
    getFilteredTools,
  } = useToolStore();

  const navigate = useNavigate();
  const filteredTools = getFilteredTools();

  return (
    <div className="min-h-screen bg-bg-primary grid-bg">
      <Header
        title="工具广场"
        subtitle="探索和管理你的 AI 工具集合"
      />

      <div className="p-6">
        <div className="flex gap-6">
          <aside className="w-56 flex-shrink-0 space-y-6">
            <div className="glass-card p-4">
              <h3 className="text-sm font-medium text-text-primary mb-3">工具分类</h3>
              <div className="space-y-1">
                {categories.map((cat) => {
                  const IconComponent = getIconByName(cat.icon) || Grid3X3;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/10 text-white border border-accent-primary/30'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 border border-transparent'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="text-sm font-medium text-text-primary mb-3">适合岗位</h3>
              <div className="space-y-1">
                {roles.slice(0, 6).map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedRole === role.id
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                    }`}
                  >
                    {role.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  {categories.find((c) => c.id === selectedCategory)?.name || '全部工具'}
                </h2>
                <p className="text-sm text-text-tertiary mt-1">
                  共 {filteredTools.length} 个工具
                </p>
              </div>

              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索工具..."
                  className="w-64 h-10 pl-10 pr-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTools.map((tool, index) => (
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

            {filteredTools.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center mb-4">
                  <SearchX className="w-10 h-10 text-text-tertiary" />
                </div>
                <p className="text-text-secondary mb-1">没有找到匹配的工具</p>
                <p className="text-sm text-text-tertiary">试试其他关键词或筛选条件</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
