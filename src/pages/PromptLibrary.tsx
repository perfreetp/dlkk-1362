import { useState } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { Header } from '@/components/layout/Header';
import { PromptCard } from '@/components/features/PromptCard';
import { promptCategories } from '@/data/prompts';
import { Plus, Search, Edit3, Trash2, Share2, Copy, Variable, Folder, Star } from 'lucide-react';
import { getIconByName } from '@/utils/iconHelper';

export function PromptLibrary() {
  const {
    prompts,
    selectedCategory,
    searchQuery,
    selectedPromptId,
    setSelectedCategory,
    setSearchQuery,
    setSelectedPromptId,
    toggleFavorite,
    toggleTeamShare,
    getFilteredPrompts,
  } = usePromptStore();

  const [searchFocused, setSearchFocused] = useState(false);
  const filteredPrompts = getFilteredPrompts();
  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="min-h-screen bg-bg-primary grid-bg">
      <Header
        title="提示词库"
        subtitle="管理和复用高质量的提示词模板"
        actionLabel="新建模板"
      />

      <div className="flex h-[calc(100vh-64px)]">
        <aside className="w-56 border-r border-border-primary bg-bg-secondary/50 p-4 space-y-2 overflow-y-auto">
          <div className="mb-4">
            <div
              className={`relative transition-all duration-300 ${
                searchFocused ? 'shadow-glow' : ''
              }`}
            >
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  searchFocused ? 'text-accent-primary' : 'text-text-tertiary'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索提示词..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:border-accent-primary/50 transition-all"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          <div className="space-y-1">
            {promptCategories.map((cat) => {
              const IconComponent = getIconByName(cat.icon) || Folder;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/10 text-white border border-accent-primary/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    {cat.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === cat.id
                      ? 'bg-accent-primary/30 text-white'
                      : 'bg-bg-tertiary text-text-tertiary'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-border-primary p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-primary">
                模板列表
              </h3>
              <span className="text-xs text-text-tertiary">
                {filteredPrompts.length} 个
              </span>
            </div>

            <div className="space-y-3">
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onToggleFavorite={toggleFavorite}
                  onToggleTeamShare={toggleTeamShare}
                  onClick={() => setSelectedPromptId(prompt.id)}
                  isSelected={selectedPromptId === prompt.id}
                />
              ))}
            </div>

            {filteredPrompts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center mb-3">
                  <Search className="w-8 h-8 text-text-tertiary" />
                </div>
                <p className="text-sm text-text-tertiary">没有找到模板</p>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {selectedPrompt ? (
              <div className="animate-fadeInUp">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">
                      {selectedPrompt.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-text-tertiary">
                        更新于 {selectedPrompt.updatedAt}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        使用 {selectedPrompt.useCount} 次
                      </span>
                      {selectedPrompt.isTeamShared && (
                        <span className="text-xs text-accent-secondary flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          团队共享
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyPrompt(selectedPrompt.content)}
                      className="h-9 px-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary hover:text-text-primary hover:border-border-hover flex items-center gap-2 text-sm transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                    <button className="h-9 px-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 hover:shadow-glow transition-all">
                      <Edit3 className="w-4 h-4" />
                      编辑
                    </button>
                  </div>
                </div>

                <div className="glass-card p-5 mb-6">
                  <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                    <Variable className="w-4 h-4 text-accent-primary" />
                    变量占位符
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.variables.map((v) => (
                      <span
                        key={v}
                        className="px-3 py-1.5 text-sm rounded-lg bg-accent-primary/15 text-accent-primary border border-accent-primary/30 font-mono"
                      >
                        {'{' + v + '}'}
                      </span>
                    ))}
                    {selectedPrompt.variables.length === 0 && (
                      <span className="text-sm text-text-tertiary">无变量</span>
                    )}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h4 className="text-sm font-medium text-text-primary mb-3">提示词内容</h4>
                  <pre className="p-4 rounded-xl bg-bg-tertiary/60 border border-border-secondary text-sm text-text-secondary whitespace-pre-wrap font-mono leading-relaxed">
                    {selectedPrompt.content}
                  </pre>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => toggleFavorite(selectedPrompt.id)}
                    className={`flex-1 h-11 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                      selectedPrompt.isFavorite
                        ? 'bg-accent-warning/20 border-accent-warning/30 text-accent-warning'
                        : 'bg-bg-tertiary/50 border-border-secondary text-text-secondary hover:text-text-primary hover:border-border-hover'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    {selectedPrompt.isFavorite ? '已收藏' : '收藏'}
                  </button>
                  <button
                    onClick={() => toggleTeamShare(selectedPrompt.id)}
                    className={`flex-1 h-11 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                      selectedPrompt.isTeamShared
                        ? 'bg-accent-secondary/20 border-accent-secondary/30 text-accent-secondary'
                        : 'bg-bg-tertiary/50 border-border-secondary text-text-secondary hover:text-text-primary hover:border-border-hover'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    {selectedPrompt.isTeamShared ? '已共享' : '共享到团队'}
                  </button>
                  <button className="h-11 px-4 rounded-xl bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm font-medium flex items-center gap-2 hover:bg-accent-danger/20 transition-all">
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 flex items-center justify-center mb-4">
                  <Plus className="w-12 h-12 text-accent-primary/50" />
                </div>
                <p className="text-text-secondary mb-2">选择一个提示词查看详情</p>
                <p className="text-sm text-text-tertiary">或者创建一个新的提示词模板</p>
                <button className="mt-6 h-10 px-6 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 hover:shadow-glow transition-all">
                  <Plus className="w-4 h-4" />
                  创建模板
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
