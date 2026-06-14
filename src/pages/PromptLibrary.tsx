import { useState, useEffect } from 'react';
import { usePromptStore } from '@/store/usePromptStore';
import { Header } from '@/components/layout/Header';
import { PromptCard } from '@/components/features/PromptCard';
import { promptCategories } from '@/data/prompts';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Share2,
  Copy,
  Variable,
  Folder,
  Star,
  FileText,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { getIconByName } from '@/utils/iconHelper';
import type { Prompt } from '@/types';

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
    addPrompt,
    updatePrompt,
    deletePrompt,
    getFilteredPrompts,
  } = usePromptStore();

  const [searchFocused, setSearchFocused] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('writing');
  const [newVariables, setNewVariables] = useState<string[]>([]);
  const [newVariableInput, setNewVariableInput] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null);

  const filteredPrompts = getFilteredPrompts();
  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);

  useEffect(() => {
    if (filteredPrompts.length > 0) {
      const currentSelectedInList = filteredPrompts.some((p) => p.id === selectedPromptId);
      if (!selectedPrompt || !currentSelectedInList) {
        setSelectedPromptId(filteredPrompts[0].id);
      }
    } else if (filteredPrompts.length === 0) {
      setSelectedPromptId(null);
    }
  }, [filteredPrompts, selectedPrompt, selectedPromptId, setSelectedPromptId]);

  useEffect(() => {
    if (showEditModal && editingPrompt) {
      setNewTitle(editingPrompt.title);
      setNewCategory(editingPrompt.category);
      setNewVariables([...editingPrompt.variables]);
      setNewContent(editingPrompt.content);
    }
  }, [showEditModal, editingPrompt]);

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleOpenNewModal = () => {
    setNewTitle('');
    setNewCategory('writing');
    setNewVariables([]);
    setNewVariableInput('');
    setNewContent('');
    setShowNewModal(true);
  };

  const handleAddVariable = () => {
    const trimmed = newVariableInput.trim();
    if (trimmed && !newVariables.includes(trimmed)) {
      setNewVariables([...newVariables, trimmed]);
      setNewVariableInput('');
    }
  };

  const handleRemoveVariable = (v: string) => {
    setNewVariables(newVariables.filter((item) => item !== v));
  };

  const handleVariableKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVariable();
    }
  };

  const handleCreatePrompt = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const availableCategories = promptCategories.filter(
      (c) => c.id !== 'favorite' && c.id !== 'team'
    );

    addPrompt({
      title: newTitle.trim(),
      content: newContent.trim(),
      variables: newVariables,
      category: newCategory,
      tags: availableCategories.find((c) => c.id === newCategory)?.name
        ? [availableCategories.find((c) => c.id === newCategory)!.name]
        : [],
      isFavorite: false,
      isTeamShared: false,
    });

    setShowNewModal(false);
  };

  const handleOpenEditModal = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setShowEditModal(true);
  };

  const handleUpdatePrompt = () => {
    if (!editingPrompt || !newTitle.trim() || !newContent.trim()) return;

    updatePrompt(editingPrompt.id, {
      title: newTitle.trim(),
      content: newContent.trim(),
      variables: newVariables,
      category: newCategory,
    });

    setShowEditModal(false);
    setEditingPrompt(null);
  };

  const handleOpenDeleteConfirm = (prompt: Prompt) => {
    setDeletingPrompt(prompt);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingPrompt) return;

    const currentIndex = filteredPrompts.findIndex((p) => p.id === deletingPrompt.id);
    deletePrompt(deletingPrompt.id);

    const newFiltered = filteredPrompts.filter((p) => p.id !== deletingPrompt.id);
    if (newFiltered.length > 0) {
      const nextIndex = Math.min(currentIndex, newFiltered.length - 1);
      setSelectedPromptId(newFiltered[nextIndex].id);
    } else {
      setSelectedPromptId(null);
    }

    setShowDeleteConfirm(false);
    setDeletingPrompt(null);
  };

  const availableCategories = promptCategories.filter(
    (c) => c.id !== 'favorite' && c.id !== 'team'
  );

  return (
    <div className="min-h-screen bg-bg-primary grid-bg">
      <Header
        title="提示词库"
        subtitle="管理和复用高质量的提示词模板"
        actionLabel="新建模板"
        onAction={handleOpenNewModal}
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
              <button
                onClick={handleOpenNewModal}
                className="text-xs text-accent-primary hover:text-accent-secondary transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                创建模板
              </button>
            </div>

            {filteredPrompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center mb-3">
                  <FileText className="w-8 h-8 text-text-tertiary" />
                </div>
                <p className="text-sm text-text-secondary mb-1">暂无提示词模板</p>
                <p className="text-xs text-text-tertiary mb-4">创建第一个模板开始使用</p>
                <button
                  onClick={handleOpenNewModal}
                  className="px-4 py-2 rounded-lg bg-accent-primary/20 text-accent-primary text-xs font-medium hover:bg-accent-primary/30 transition-colors"
                >
                  + 创建模板
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    isSelected={selectedPromptId === prompt.id}
                    onClick={() => setSelectedPromptId(prompt.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedPrompt ? (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">
                      {selectedPrompt.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                        {promptCategories.find((c) => c.id === selectedPrompt.category)?.name || '未分类'}
                      </span>
                      {selectedPrompt.isTeamShared && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20">
                          团队共享
                        </span>
                      )}
                      <span className="text-xs text-text-tertiary">
                        更新于 {selectedPrompt.updatedAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(selectedPrompt)}
                      className="p-2 rounded-lg bg-bg-tertiary/50 border border-border-secondary text-text-secondary hover:text-accent-primary hover:border-accent-primary/30 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteConfirm(selectedPrompt)}
                      className="p-2 rounded-lg bg-bg-tertiary/50 border border-border-secondary text-text-secondary hover:text-accent-danger hover:border-accent-danger/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {selectedPrompt.variables.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-bg-tertiary/30 border border-border-secondary">
                    <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                      <Variable className="w-4 h-4 text-accent-primary" />
                      模板变量
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrompt.variables.map((v) => (
                        <span
                          key={v}
                          className="px-3 py-1 text-xs rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 font-mono"
                        >
                          {`{${v}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent-primary" />
                    提示词内容
                  </h3>
                  <div className="p-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary">
                    <pre className="whitespace-pre-wrap text-sm text-text-secondary font-mono leading-relaxed">
                      {selectedPrompt.content}
                    </pre>
                  </div>
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
                  <button
                    onClick={() => handleCopyPrompt(selectedPrompt.content)}
                    className="h-11 px-4 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-sm font-medium flex items-center gap-2 hover:bg-accent-primary/20 transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </button>
                  <button
                    onClick={() => handleOpenDeleteConfirm(selectedPrompt)}
                    className="h-11 px-4 rounded-xl bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm font-medium flex items-center gap-2 hover:bg-accent-danger/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-text-tertiary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  选择一个提示词查看详情
                </h3>
                <p className="text-sm text-text-tertiary mb-6">
                  或者创建一个新的提示词模板
                </p>
                <button
                  onClick={handleOpenNewModal}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 hover:shadow-glow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  创建模板
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-2xl max-h-[85vh] overflow-hidden animate-fadeInUp flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-secondary">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">新建提示词模板</h3>
                <p className="text-sm text-text-tertiary mt-1">
                  创建一个可复用的高质量提示词模板
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-lg bg-bg-tertiary/50 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  模板标题 <span className="text-accent-danger">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="输入模板标题..."
                  className="w-full h-10 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                />
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  分类 <span className="text-accent-danger">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableCategories.map((cat) => {
                    const IconComponent = getIconByName(cat.icon) || Folder;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setNewCategory(cat.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          newCategory === cat.id
                            ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary'
                            : 'bg-bg-tertiary/30 border-border-secondary text-text-secondary hover:border-accent-primary/30'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  模板变量（可选）
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newVariableInput}
                    onChange={(e) => setNewVariableInput(e.target.value)}
                    onKeyDown={handleVariableKeyDown}
                    placeholder="输入变量名后按 Enter 添加..."
                    className="flex-1 h-10 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                  />
                  <button
                    onClick={handleAddVariable}
                    className="h-10 px-4 rounded-xl bg-accent-primary/20 text-accent-primary text-sm font-medium hover:bg-accent-primary/30 transition-all"
                  >
                    添加
                  </button>
                </div>
                {newVariables.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newVariables.map((v) => (
                      <span
                        key={v}
                        className="px-3 py-1 text-xs rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 font-mono flex items-center gap-1"
                      >
                        {`{${v}}`}
                        <button
                          onClick={() => handleRemoveVariable(v)}
                          className="hover:text-accent-danger transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  提示词内容 <span className="text-accent-danger">*</span>
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="输入提示词内容，使用 {变量名} 表示可替换的变量..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm resize-none font-mono focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-border-secondary">
              <button
                onClick={() => setShowNewModal(false)}
                className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
              >
                取消
              </button>
              <button
                onClick={handleCreatePrompt}
                disabled={!newTitle.trim() || !newContent.trim()}
                className={`h-10 px-5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                  !newTitle.trim() || !newContent.trim()
                    ? 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:shadow-glow'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                创建模板
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-2xl max-h-[85vh] overflow-hidden animate-fadeInUp flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border-secondary">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">编辑提示词模板</h3>
                <p className="text-sm text-text-tertiary mt-1">
                  修改提示词模板的内容和配置
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPrompt(null);
                }}
                className="w-8 h-8 rounded-lg bg-bg-tertiary/50 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  模板标题 <span className="text-accent-danger">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="输入模板标题..."
                  className="w-full h-10 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                />
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  分类 <span className="text-accent-danger">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableCategories.map((cat) => {
                    const IconComponent = getIconByName(cat.icon) || Folder;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setNewCategory(cat.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          newCategory === cat.id
                            ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary'
                            : 'bg-bg-tertiary/30 border-border-secondary text-text-secondary hover:border-accent-primary/30'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  模板变量（可选）
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newVariableInput}
                    onChange={(e) => setNewVariableInput(e.target.value)}
                    onKeyDown={handleVariableKeyDown}
                    placeholder="输入变量名后按 Enter 添加..."
                    className="flex-1 h-10 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                  />
                  <button
                    onClick={handleAddVariable}
                    className="h-10 px-4 rounded-xl bg-accent-primary/20 text-accent-primary text-sm font-medium hover:bg-accent-primary/30 transition-all"
                  >
                    添加
                  </button>
                </div>
                {newVariables.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newVariables.map((v) => (
                      <span
                        key={v}
                        className="px-3 py-1 text-xs rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 font-mono flex items-center gap-1"
                      >
                        {`{${v}}`}
                        <button
                          onClick={() => handleRemoveVariable(v)}
                          className="hover:text-accent-danger transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  提示词内容 <span className="text-accent-danger">*</span>
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="输入提示词内容，使用 {变量名} 表示可替换的变量..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm resize-none font-mono focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-border-secondary">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPrompt(null);
                }}
                className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
              >
                取消
              </button>
              <button
                onClick={handleUpdatePrompt}
                disabled={!newTitle.trim() || !newContent.trim()}
                className={`h-10 px-5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                  !newTitle.trim() || !newContent.trim()
                    ? 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:shadow-glow'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && deletingPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-md overflow-hidden animate-fadeInUp">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-accent-danger/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-accent-danger" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                确认删除提示词模板
              </h3>
              <p className="text-sm text-text-tertiary mb-6">
                确定要删除「{deletingPrompt.title}」吗？此操作不可撤销。
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingPrompt(null);
                  }}
                  className="h-10 px-5 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="h-10 px-5 rounded-xl bg-accent-danger text-white text-sm font-medium hover:bg-accent-danger/90 transition-all"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
