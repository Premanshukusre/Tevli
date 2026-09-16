import { useWorkspaces } from '../features/workspaces/queries';
import { useProjectsByWorkspace } from '../features/projects/queries';
import { useMyTasks, useTasks } from '../features/tasks/queries';
import { useRecentWorkspaces } from '../lib/storage';
import { Link, useSearchParams } from 'react-router-dom';
import { getThemeForString } from '../lib/color';
import { CardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useEffect, useState } from 'react';

export const Dashboard = () => {
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const { data: myTasks } = useMyTasks();
  const [, setSearchParams] = useSearchParams();
  const { getRecent } = useRecentWorkspaces();
  const [recentWorkspaces, setRecentWorkspaces] = useState<any[]>([]);

  useEffect(() => {
    setRecentWorkspaces(getRecent().slice(0, 3));
  }, []);

  if (error) return <div className="p-8 text-center text-red-600">Failed to load home data</div>;

  const handleCreateWorkspace = () => {
    setSearchParams(prev => {
      prev.set('createWorkspace', 'true');
      return prev;
    });
  };

  const tasksDueSoon = myTasks?.filter(t => t.due_date && new Date(t.due_date) >= new Date() && t.status !== 'DONE').slice(0, 3) || [];
  const activeTasksCount = myTasks?.filter(t => t.status !== 'DONE').length || 0;
  const completedTasksCount = myTasks?.filter(t => t.status === 'DONE').length || 0;

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-8 animate-in fade-in duration-200 space-y-12">
      {/* Header section */}
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Home</h2>
        <p className="text-sm text-gray-500 mt-2">Here's an overview of what's happening.</p>
      </div>

      {/* Top section: Summary & Recent */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Task Summary */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">My Task Summary</h3>
            <Link to="/my-tasks" className="text-sm font-medium text-primary-600 hover:text-primary-800">View all tasks &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-indigo-50/50 border-indigo-100">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-indigo-700 mb-1">{activeTasksCount}</div>
                <div className="text-sm font-medium text-indigo-600">Active Tasks</div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50/50 border-emerald-100">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-emerald-700 mb-1">{completedTasksCount}</div>
                <div className="text-sm font-medium text-emerald-600">Completed Tasks</div>
              </CardContent>
            </Card>
          </div>

          {tasksDueSoon.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Due Soon</h3>
              <div className="space-y-3">
                {tasksDueSoon.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                      <span className="font-medium text-gray-900 text-sm">{task.title}</span>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      {new Date(task.due_date!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Workspaces */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          {recentWorkspaces.length === 0 ? (
            <Card className="border-dashed bg-gray-50/50">
              <CardContent className="p-6 text-center text-sm text-gray-500">
                No recent activity to show.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentWorkspaces.map(ws => (
                <Link key={ws.id} to={`/workspaces/${ws.id}`} className="block group">
                  <Card className="transition-all hover:border-gray-400 hover:shadow-sm">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold shadow-sm ${getThemeForString(ws.name)}`}>
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">{ws.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">Workspace</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Workspaces Section */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-gray-900">All Workspaces</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your team's projects and boards</p>
          </div>
          <Button 
            onClick={handleCreateWorkspace}
            variant="secondary"
          >
            Create Workspace
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : workspaces?.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center bg-gray-50/50">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">Get started by creating a workspace to organize your projects and collaborate with your team.</p>
            <Button 
              variant="secondary"
              onClick={handleCreateWorkspace}
            >
              Create First Workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces?.map(ws => (
              <WorkspaceCard key={ws.id} workspace={ws} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const WorkspaceCard = ({ workspace }: { workspace: { id: string; name: string; created_at: string } }) => {
  const { data: projects, isLoading } = useProjectsByWorkspace(workspace.id);

  return (
    <Link to={`/workspaces/${workspace.id}`} className="block group h-full">
      <Card className="h-full transition-all hover:border-gray-400 hover:shadow-sm flex flex-col">
        <CardHeader className="flex flex-row items-center space-x-4 pb-4 shrink-0">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-semibold transition-colors shadow-sm ${getThemeForString(workspace.name)}`}>
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="group-hover:text-primary-700 transition-colors truncate">
              {workspace.name}
            </CardTitle>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              Created {new Date(workspace.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col border-t border-gray-100 pt-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {isLoading ? 'Loading projects...' : `${projects?.length || 0} Project${projects?.length !== 1 ? 's' : ''}`}
          </div>
          {!isLoading && projects && projects.length > 0 && (
            <div className="space-y-2 mb-4">
              {projects.slice(0, 3).map(p => (
                <ProjectPreviewRow key={p.id} projectId={p.id} projectName={p.name} />
              ))}
              {projects.length > 3 && (
                <div className="text-xs text-gray-400 font-medium pl-3.5">
                  +{projects.length - 3} more
                </div>
              )}
            </div>
          )}
          <div className="mt-auto pt-2">
            <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700">Open Workspace &rarr;</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const ProjectPreviewRow = ({ projectId, projectName }: { projectId: string, projectName: string }) => {
  const { data: tasks, isLoading } = useTasks(projectId);
  const taskCount = tasks?.length || 0;

  return (
    <div className="text-sm text-gray-700 flex justify-between items-center group/row">
      <div className="flex items-center truncate">
        <div className="w-1.5 h-1.5 rounded-full bg-primary-300 mr-2 shrink-0 group-hover/row:bg-primary-500 transition-colors"></div>
        <span className="truncate">{projectName}</span>
      </div>
      {!isLoading && taskCount > 0 && (
        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium ml-2 shrink-0">
          {taskCount} task{taskCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};
