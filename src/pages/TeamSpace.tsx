import { useState } from 'react';
import { useTeamStore } from '@/store/useTeamStore';
import { useToolStore } from '@/store/useToolStore';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/features/StatCard';
import {
  Users,
  Wrench,
  Sparkles,
  Lightbulb,
  Crown,
  AlertTriangle,
  TrendingUp,
  Check,
  X,
  Clock,
  Plus,
  ChevronRight,
  Award,
  GitBranch,
  Zap,
  Star,
  UserPlus,
} from 'lucide-react';

export function TeamSpace() {
  const {
    members,
    toolRequests,
    flowSuggestions,
    stats,
    setSelectedTab,
    selectedTab,
    approveRequest,
    rejectRequest,
    addToolRequest,
  } = useTeamStore();

  const { tools, toggleTeamRecommend } = useToolStore();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [requestReason, setRequestReason] = useState('');

  const tabs = [
    { id: 'overview', label: '概览', icon: Sparkles },
    { id: 'recommendations', label: '推荐清单', icon: Award },
    { id: 'requests', label: '工具申请', icon: GitBranch },
    { id: 'members', label: '成员管理', icon: Users },
    { id: 'suggestions', label: '优化建议', icon: Lightbulb },
  ];

  const statCards = [
    { title: '团队成员', value: stats.totalMembers, icon: Users, trend: '2 人本月新增', trendUp: true, gradientFrom: '#8b5cf6', gradientTo: '#ec4899' },
    { title: '可用工具', value: stats.totalTools, icon: Wrench, trend: '6 个团队推荐', trendUp: true, gradientFrom: '#06b6d4', gradientTo: '#8b5cf6' },
    { title: '月节省时间', value: stats.monthlySaving, icon: Clock, trend: `效率提升 ${stats.efficiencyGain}%`, trendUp: true, gradientFrom: '#10b981', gradientTo: '#06b6d4' },
    { title: '优化建议', value: flowSuggestions.length, icon: Lightbulb, trend: '2 条高优先级', trendUp: false, gradientFrom: '#f59e0b', gradientTo: '#ef4444' },
  ];

  const handleSubmitRequest = () => {
    if (requestName && requestReason) {
      addToolRequest(requestName, requestReason, '1', '张三');
      setRequestName('');
      setRequestReason('');
      setShowRequestModal(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-accent-danger bg-accent-danger/20 border-accent-danger/30';
      case 'medium': return 'text-accent-warning bg-accent-warning/20 border-accent-warning/30';
      case 'low': return 'text-accent-secondary bg-accent-secondary/20 border-accent-secondary/30';
      default: return 'text-text-tertiary bg-bg-tertiary border-border-secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'duplicate': return AlertTriangle;
      case 'inefficient': return TrendingUp;
      case 'optimization': return Lightbulb;
      default: return Sparkles;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary aurora-bg">
      <Header
        title="团队空间"
        subtitle="管理团队资源和优化工作流程"
      />

      <div className="p-6">
        <div className="flex gap-6">
          <div className="w-48 flex-shrink-0 space-y-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/10 text-white border border-accent-primary/30 shadow-glow'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50 border border-transparent'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-w-0">
            {selectedTab === 'overview' && (
              <div className="space-y-6 animate-fadeInUp">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((stat, index) => (
                    <div key={stat.title} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fadeInUp">
                      <StatCard {...stat} />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-accent-primary" />
                      团队成员
                    </h3>
                    <div className="space-y-3">
                      {members.slice(0, 4).map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-tertiary/30 transition-all">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary/30 to-accent-secondary/20 flex items-center justify-center text-xl">
                            {member.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-text-primary">{member.name}</p>
                              {member.role === 'admin' && (
                                <Crown className="w-3.5 h-3.5 text-accent-warning" />
                              )}
                            </div>
                            <p className="text-xs text-text-tertiary">{member.position}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-text-primary">{member.taskCount}</p>
                            <p className="text-[10px] text-text-tertiary">任务</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 h-9 rounded-xl border border-border-secondary text-text-secondary text-sm flex items-center justify-center gap-1 hover:text-text-primary hover:border-border-hover transition-all">
                      <UserPlus className="w-4 h-4" />
                      查看全部成员
                    </button>
                  </div>

                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-text-primary flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-accent-warning" />
                        优化建议
                      </h3>
                      <span className="text-xs text-accent-warning">{flowSuggestions.length} 条</span>
                    </div>
                    <div className="space-y-3">
                      {flowSuggestions.slice(0, 3).map((suggestion) => {
                        const TypeIcon = getTypeIcon(suggestion.type);
                        return (
                          <div
                            key={suggestion.id}
                            className="p-3 rounded-xl bg-bg-tertiary/30 border border-border-secondary hover:border-accent-primary/30 transition-all cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getPriorityColor(suggestion.priority)}`}>
                                <TypeIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary">{suggestion.title}</p>
                                <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{suggestion.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button className="w-full mt-4 h-9 rounded-xl border border-border-secondary text-text-secondary text-sm flex items-center justify-center gap-1 hover:text-text-primary hover:border-border-hover transition-all">
                      查看全部建议
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-text-primary flex items-center gap-2">
                      <Award className="w-5 h-5 text-accent-secondary" />
                      团队推荐工具
                    </h3>
                    <span className="text-xs text-accent-secondary">{stats.teamRecommended} 个工具</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tools.filter((t) => t.isTeamRecommended).slice(0, 6).map((tool) => (
                      <div
                        key={tool.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary/30 border border-border-secondary hover:border-accent-secondary/30 transition-all cursor-pointer"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`,
                          }}
                        >
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{tool.name}</p>
                          <p className="text-xs text-text-tertiary truncate">{tool.tags[0]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'recommendations' && (
              <div className="animate-fadeInUp">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">团队推荐清单</h2>
                    <p className="text-sm text-text-tertiary mt-1">管理员推荐的工具和模板</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {tools.map((tool) => (
                    <div
                      key={tool.id}
                      className={`glass-card p-4 flex items-center gap-4 transition-all ${
                        tool.isTeamRecommended ? 'border-accent-secondary/40' : ''
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${tool.gradientFrom}, ${tool.gradientTo})`,
                        }}
                      >
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-text-primary">{tool.name}</h4>
                        <p className="text-sm text-text-tertiary line-clamp-1">{tool.description}</p>
                      </div>
                      <button
                        onClick={() => toggleTeamRecommend(tool.id)}
                        className={`h-9 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                          tool.isTeamRecommended
                            ? 'bg-accent-secondary/20 border border-accent-secondary/40 text-accent-secondary'
                            : 'bg-bg-tertiary/50 border border-border-secondary text-text-secondary hover:text-text-primary hover:border-border-hover'
                        }`}
                      >
                        {tool.isTeamRecommended ? (
                          <>
                            <Check className="w-4 h-4" />
                            已推荐
                          </>
                        ) : (
                          '设为推荐'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'requests' && (
              <div className="animate-fadeInUp">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">工具申请</h2>
                    <p className="text-sm text-text-tertiary mt-1">管理新工具的申请和审批</p>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="h-10 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 hover:shadow-glow transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    提交申请
                  </button>
                </div>

                <div className="space-y-3">
                  {toolRequests.map((request) => (
                    <div key={request.id} className="glass-card p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            request.status === 'pending'
                              ? 'bg-accent-warning/20 text-accent-warning'
                              : request.status === 'approved'
                              ? 'bg-accent-success/20 text-accent-success'
                              : 'bg-accent-danger/20 text-accent-danger'
                          }`}>
                            {request.status === 'pending' ? (
                              <Clock className="w-5 h-5" />
                            ) : request.status === 'approved' ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <X className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-text-primary">{request.name}</h4>
                            <p className="text-xs text-text-tertiary">
                              申请人：{request.applicantName} · {request.createdAt}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending'
                            ? 'bg-accent-warning/20 text-accent-warning'
                            : request.status === 'approved'
                            ? 'bg-accent-success/20 text-accent-success'
                            : 'bg-accent-danger/20 text-accent-danger'
                        }`}>
                          {request.status === 'pending' ? '待审批' : request.status === 'approved' ? '已通过' : '已拒绝'}
                        </span>
                      </div>

                      <p className="text-sm text-text-secondary mt-3 p-3 bg-bg-tertiary/40 rounded-lg">
                        {request.reason}
                      </p>

                      {request.status === 'pending' && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => approveRequest(request.id)}
                            className="flex-1 h-9 rounded-xl bg-accent-success/20 border border-accent-success/30 text-accent-success text-sm font-medium hover:bg-accent-success/30 transition-all"
                          >
                            通过申请
                          </button>
                          <button
                            onClick={() => rejectRequest(request.id)}
                            className="flex-1 h-9 rounded-xl bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm font-medium hover:bg-accent-danger/20 transition-all"
                          >
                            拒绝
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'members' && (
              <div className="animate-fadeInUp">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">成员管理</h2>
                    <p className="text-sm text-text-tertiary mt-1">共 {members.length} 位成员</p>
                  </div>
                  <button className="h-10 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 hover:shadow-glow transition-all">
                    <UserPlus className="w-4 h-4" />
                    邀请成员
                  </button>
                </div>

                <div className="glass-card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-primary">
                        <th className="text-left p-4 text-xs font-medium text-text-tertiary">成员</th>
                        <th className="text-left p-4 text-xs font-medium text-text-tertiary">职位</th>
                        <th className="text-left p-4 text-xs font-medium text-text-tertiary">角色</th>
                        <th className="text-left p-4 text-xs font-medium text-text-tertiary">加入时间</th>
                        <th className="text-left p-4 text-xs font-medium text-text-tertiary">任务数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-border-secondary hover:bg-bg-tertiary/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-primary/30 to-accent-secondary/20 flex items-center justify-center">
                                {member.avatar}
                              </div>
                              <span className="text-sm font-medium text-text-primary">{member.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-text-secondary">{member.position}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              member.role === 'admin'
                                ? 'bg-accent-primary/20 text-accent-primary'
                                : 'bg-bg-tertiary text-text-tertiary'
                            }`}>
                              {member.role === 'admin' ? '管理员' : '成员'}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-text-tertiary">{member.joinDate}</td>
                          <td className="p-4 text-sm text-text-secondary font-medium">{member.taskCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'suggestions' && (
              <div className="animate-fadeInUp">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-text-primary">流程优化建议</h2>
                  <p className="text-sm text-text-tertiary mt-1">基于团队使用数据分析的优化建议</p>
                </div>

                <div className="space-y-4">
                  {flowSuggestions.map((suggestion, index) => {
                    const TypeIcon = getTypeIcon(suggestion.type);
                    return (
                      <div
                        key={suggestion.id}
                        className="glass-card p-5 animate-fadeInUp"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getPriorityColor(suggestion.priority)}`}>
                            <TypeIcon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-text-primary">{suggestion.title}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(suggestion.priority)}`}>
                                {suggestion.priority === 'high' ? '高优先级' : suggestion.priority === 'medium' ? '中优先级' : '低优先级'}
                              </span>
                            </div>

                            <p className="text-sm text-text-secondary mb-4">{suggestion.description}</p>

                            <div className="p-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary">
                              <p className="text-xs text-text-tertiary mb-2 flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" />
                                建议方案
                              </p>
                              <p className="text-sm text-text-primary">{suggestion.suggestion}</p>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                              <span className="text-xs text-text-tertiary">相关工具：</span>
                              {suggestion.relatedTools.map((tool) => (
                                <span
                                  key={tool}
                                  className="px-2 py-1 text-xs rounded-lg bg-accent-primary/15 text-accent-primary"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-3 mt-4">
                              <button className="h-9 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium flex items-center gap-2 hover:shadow-glow transition-all">
                                <Star className="w-4 h-4" />
                                采纳建议
                              </button>
                              <button className="h-9 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm hover:text-text-primary hover:border-border-hover transition-all">
                                稍后再说
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card w-full max-w-md p-6 animate-fadeInUp">
            <h3 className="text-lg font-semibold text-text-primary mb-4">提交新工具申请</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">工具名称</label>
                <input
                  type="text"
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="输入工具名称..."
                  className="w-full h-10 px-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                />
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-2 block">申请理由</label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="说明为什么需要这个工具..."
                  className="w-full h-32 p-4 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-primary placeholder-text-tertiary text-sm resize-none focus:outline-none focus:border-accent-primary/50 focus:shadow-glow transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 h-10 rounded-xl bg-bg-tertiary/50 border border-border-secondary text-text-secondary text-sm font-medium hover:text-text-primary hover:border-border-hover transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSubmitRequest}
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-sm font-medium hover:shadow-glow transition-all"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
