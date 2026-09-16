import { useState } from 'react';
import { useProjectActivity } from '../queries';
import { useUser } from '../../auth/queries';
import { useTasks } from '../../tasks/queries';
import { Activity } from '../api';

export const ActivityFeed = ({ projectId }: { projectId: string }) => {
  const { data: activities, isLoading } = useProjectActivity(projectId);
  const { data: tasks } = useTasks(projectId);
  const { data: user } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'MY'>('ALL');
  const [viewMode, setViewMode] = useState<'FLAT' | 'GROUPED'>('GROUPED');

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (d.toDateString() === now.toDateString()) {
      return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getActionColor = (act: Activity) => {
    const details = act.details?.toUpperCase() || '';
    if (act.action === 'TASK_CREATED') return 'border-primary-400 bg-white';
    if (act.action === 'TASK_DELETED') return 'border-red-400 bg-white';
    if (details.includes('TO DONE') || details.includes('COMPLETED')) return 'border-emerald-400 bg-white';
    if (act.action === 'COMMENT_ADDED') return 'border-slate-300 bg-white';
    return 'border-gray-300 bg-white';
  };

  const formatActionText = (act: Activity) => {
    if (act.action === 'TASK_CREATED') return 'created task';
    if (act.action === 'TASK_DELETED') return 'deleted task';
    if (act.action === 'COMMENT_ADDED') return 'added a comment';
    if (act.action === 'TASK_UPDATED' && act.details?.includes('Moved')) return 'moved task';
    if (act.action === 'TASK_UPDATED' && act.details?.includes('Priority')) return 'changed priority';
    return act.details || act.action.toLowerCase().replace('_', ' ');
  };

  if (isLoading) return <div className="text-gray-500 text-sm p-4 w-64 shrink-0 border-l border-gray-200 bg-white">Loading activity...</div>;
  if (!activities) return null;

  // Filter logic
  const filteredActivities = filter === 'MY' && user ? activities.filter(a => a.user_id === user.id) : activities;

  // Grouping logic
  const groupedTasks = filteredActivities.reduce((acc: Record<string, Activity[]>, curr) => {
    const key = curr.entity_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  const previewActivities = activities.slice(0, 5);

  return (
    <>
      {/* Activity Preview Panel (Always on right) */}
      <div className="w-64 shrink-0 border-l border-gray-200 bg-white flex flex-col hidden lg:flex h-full p-5 relative z-10">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-sm font-semibold tracking-tight text-gray-900">Recent Activity</h3>
          <button 
            onClick={() => setDrawerOpen(true)}
            className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
          >
            View all
          </button>
        </div>
        
        {previewActivities.length === 0 ? (
          <div className="text-gray-500 text-sm">No recent activity.</div>
        ) : (
          <div className="overflow-y-auto flex-1 pr-2 relative">
            <div className="absolute left-[7px] top-2 bottom-0 w-px bg-gray-200"></div>
            <div className="space-y-5">
              {previewActivities.map(act => (
                <div key={act.id} className="text-sm relative pl-5">
                  <div className={`absolute left-[3px] top-1.5 w-[9px] h-[9px] rounded-full border-2 ring-4 ring-white ${getActionColor(act)}`}></div>
                  <div className="text-gray-900 font-medium leading-snug">
                    {act.user.name} <span className="text-gray-500 font-normal">{formatActionText(act)}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{formatTime(act.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-lg h-full bg-surface shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-300 border-l border-gray-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">Activity Center</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="px-6 py-4 border-b border-gray-100 flex space-x-4 bg-gray-50/50 shrink-0">
              <div className="flex bg-white rounded-md border border-gray-200 p-0.5 shadow-sm text-sm font-medium">
                <button 
                  className={`px-3 py-1 rounded-md transition-colors ${filter === 'ALL' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setFilter('ALL')}
                >
                  All Activity
                </button>
                <button 
                  className={`px-3 py-1 rounded-md transition-colors ${filter === 'MY' ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setFilter('MY')}
                >
                  My Activity
                </button>
              </div>

              <div className="flex bg-white rounded-md border border-gray-200 p-0.5 shadow-sm text-sm font-medium">
                <button 
                  className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'GROUPED' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setViewMode('GROUPED')}
                >
                  By Task
                </button>
                <button 
                  className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'FLAT' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setViewMode('FLAT')}
                >
                  Timeline
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {filteredActivities.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No activity found.</div>
              ) : viewMode === 'FLAT' ? (
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-0 w-px bg-gray-200"></div>
                  <div className="space-y-6">
                    {filteredActivities.map(act => (
                      <div key={act.id} className="text-sm relative pl-6">
                        <div className={`absolute left-[3px] top-1.5 w-[9px] h-[9px] rounded-full border-2 ring-4 ring-white ${getActionColor(act)}`}></div>
                        <div className="text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-1">{formatTime(act.created_at)}</div>
                        <div className="text-gray-700 leading-snug">
                          <span className="font-semibold text-gray-900">{act.user.name}</span>{' '}
                          {formatActionText(act)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedTasks).map(([taskId, groupActivities]) => {
                    const task = tasks?.find(t => t.id === taskId);
                    const titleDisplay = task ? task.title : `Deleted Task (${taskId.substring(0, 8)})`;
                    
                    return (
                    <div key={taskId} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h4 className="font-medium text-gray-900 text-sm truncate pr-4" title={titleDisplay}>{titleDisplay}</h4>
                        <span className="text-xs text-gray-500 font-medium bg-gray-200 px-2 py-0.5 rounded-full shrink-0">{groupActivities.length} changes</span>
                      </div>
                      <div className="p-4 bg-white relative">
                        <div className="absolute left-[23px] top-6 bottom-4 w-px bg-gray-200"></div>
                        <div className="space-y-5">
                          {groupActivities.map(act => (
                            <div key={act.id} className="text-sm relative pl-8">
                              <div className={`absolute left-[19px] top-1.5 w-[9px] h-[9px] rounded-full border-2 ring-4 ring-white ${getActionColor(act)}`}></div>
                              <div className="flex justify-between items-start">
                                <div className="text-gray-900 leading-snug pr-4">
                                  <span className="font-semibold">{act.user.name}</span> {formatActionText(act)}
                                </div>
                                <div className="text-[10px] text-gray-400 font-medium uppercase shrink-0 mt-0.5">{formatTime(act.created_at)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
