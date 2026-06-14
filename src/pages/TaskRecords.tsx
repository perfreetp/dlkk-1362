import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useToolStore } from '@/store/useToolStore';
import { Header } from '@/components/layout/Header';
import { TaskRecordCard } from '@/components/features/TaskRecordCard';
import {
  Filter,
  Star,
  Bookmark,
  Calendar,
  Clock,
  Zap,
  MessageSquare,
  ChevronDown,
  Search,
} from 'lucide-react';

export function TaskRecords() {
  const {
    records,
    filterTool,
    filterRating,
    showFavoritesOnly,
    setFilterTool,
    setFilterRating,
    setShowFavoritesOnly,
    toggleFavorite,
    setRating,
    getFilteredRecords,
  } = useTaskStore();

  const { tools } = useToolStore();
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredRecords = getFilteredRecords();
  const selectedRecord = records.find((r) => r.id === selectedRecordId);

  const groupByDate = (records: typeof filteredRecords) => {
    const groups: Record<string, typeof filteredRecords> = {};
    records.forEach((record) => {
      const date = record.createdAt.split(' ')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
    });
    return groups;
  };

  const groupedRecords = groupByDate(filteredRecords);

  return (
    <div className="min-h-screen bg-bg-primary grid-bg">
      <Header
        title="任务记录"
        subtitle="查看和管理所有 AI 任务产出"
      />

      <div className="flex h-[calc(100vh-64px)]">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-primary bg-bg-secondary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <select
                    value={filterTool}
                    onChange={(e) => setFilterTool(e.target.value)}
                    className="h-9 pl-9 pr-8 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm appearance-none focus:outline-none focus:border-accent-primary/50 cursor-pointer"
                  >
                    <option value="all">全部工具</option>
                    {tools.map((tool) => (
                      <option key={tool.id} value={tool.id}>
                        {tool.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="h-9 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm flex items-center gap-2 hover:text-text-primary hover:border-border-hover transition-all"
                  >
                    <Star className="w-4 h-4" />
                    {filterRating > 0 ? `${filterRating} 星以上` : '全部评分'}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showFilterDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 glass-card p-2 z-50">
                      {[0, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => {
                            setFilterRating(rating);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                            filterRating === rating
                              ? 'bg-accent-primary/20 text-accent-primary'
                              : 'text-text-secondary hover:bg-bg-tertiary/50 hover:text-text-primary'
                          }`}
                        >
                          {rating === 0 ? '全部评分' : `${rating} 星以上`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`h-9 px-4 rounded-xl border text-sm flex items-center gap-2 transition-all ${
                    showFavoritesOnly
                      ? 'bg-accent-warning/20 border-accent-warning/30 text-accent-warning'
                      : 'bg-bg-tertiary/50 border-border-secondary text-text-secondary hover:text-text-primary hover:border-border-hover'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  仅收藏
                </button>
              </div>

              <div className="text-sm text-text-tertiary">
                共 {filteredRecords.length} 条记录
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {Object.entries(groupedRecords).map(([date, dayRecords]) => (
              <div key={date} className="mb-6">
                <div className="flex items-center gap-2 mb-3 sticky top-0 bg-bg-primary/80 backdrop-blur-sm py-2 z-10">
                  <Calendar className="w-4 h-4 text-text-tertiary" />
                  <span className="text-sm font-medium text-text-secondary">{date}</span>
                  <span className="text-xs text-text-tertiary">{dayRecords.length} 条</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {dayRecords.map((record, index) => (
                    <div
                      key={record.id}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <TaskRecordCard
                        record={record}
                        onToggleFavorite={toggleFavorite}
                        onSetRating={setRating}
                        onClick={() => setSelectedRecordId(record.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-text-tertiary" />
                </div>
                <p className="text-text-secondary mb-1">没有找到匹配的记录</p>
                <p className="text-sm text-text-tertiary">试试调整筛选条件</p>
              </div>
            )}
          </div>
        </div>

        {selectedRecord && (
          <div className="w-96 border-l border-border-primary bg-bg-secondary/50 overflow-y-auto">
            <div className="p-4 border-b border-border-primary">
              <button
                onClick={() => setSelectedRecordId(null)}
                className="text-sm text-accent-primary hover:text-accent-secondary"
              >
                ← 返回列表
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${selectedRecord.gradientFrom}, ${selectedRecord.gradientTo})`,
                  }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{selectedRecord.toolName}</h3>
                  <p className="text-xs text-text-tertiary">{selectedRecord.createdAt}</p>
                </div>
              </div>

              <div className="glass-card p-4">
                <p className="text-xs text-text-tertiary mb-2">输入</p>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{selectedRecord.input}</p>
              </div>

              <div className="glass-card p-4">
                <p className="text-xs text-text-tertiary mb-2">输出结果</p>
                <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                  {selectedRecord.output}
                </p>
              </div>

              <div className="glass-card p-4">
                <p className="text-xs text-text-tertiary mb-3">评分</p>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(selectedRecord.id, star)}
                      className="hover:scale-110 transition-transform"
                    >
                      {star <= selectedRecord.rating ? (
                        <Star className="w-6 h-6 fill-accent-warning text-accent-warning" />
                      ) : (
                        <Star className="w-6 h-6 text-text-tertiary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card p-4">
                <p className="text-xs text-text-tertiary mb-2 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  我的评语
                </p>
                <textarea
                  value={selectedRecord.comment || ''}
                  placeholder="添加评语..."
                  className="w-full h-20 p-3 rounded-lg bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm resize-none focus:outline-none focus:border-accent-primary/50"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card p-3 text-center">
                  <Clock className="w-4 h-4 text-accent-secondary mx-auto mb-1" />
                  <p className="text-lg font-semibold text-text-primary">{selectedRecord.duration}s</p>
                  <p className="text-[10px] text-text-tertiary">耗时</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <Zap className="w-4 h-4 text-accent-primary mx-auto mb-1" />
                  <p className="text-lg font-semibold text-text-primary">{selectedRecord.quotaUsed}</p>
                  <p className="text-[10px] text-text-tertiary">消耗额度</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <Star className="w-4 h-4 text-accent-warning mx-auto mb-1" />
                  <p className="text-lg font-semibold text-text-primary">{selectedRecord.rating}</p>
                  <p className="text-[10px] text-text-tertiary">评分</p>
                </div>
              </div>

              <button
                onClick={() => toggleFavorite(selectedRecord.id)}
                className={`w-full h-11 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  selectedRecord.isFavorite
                    ? 'bg-accent-warning/20 border-accent-warning/30 text-accent-warning'
                    : 'bg-bg-tertiary/50 border-border-secondary text-text-secondary hover:text-text-primary hover:border-border-hover'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {selectedRecord.isFavorite ? '已收藏' : '收藏此记录'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
