import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useProject } from '../features/projects/queries';
import { useTasks } from '../features/tasks/queries';
import { KanbanBoard } from '../features/tasks/components/KanbanBoard';
import { TaskModal } from '../features/tasks/components/TaskModal';
import { ProjectSettingsModal } from '../features/projects/components/ProjectSettingsModal';
import { ActivityFeed } from '../features/activity/components/ActivityFeed';
import { ConnectionStatus } from '../features/projects/components/ConnectionStatus';
import { ProjectMembers } from '../features/projects/components/ProjectMembers';
import { Task } from '../features/tasks/api';
import { Comment } from '../features/comments/api';
import { Activity } from '../features/activity/api';
import { socketClient } from '../lib/socket';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';

export const ProjectDetails = () => {
  const { projectId } = useParams();
  const { data: project, isLoading: pLoading, isError: pError } = useProject(projectId!);
  const { data: tasks, isLoading: tLoading } = useTasks(projectId!);
  const queryClient = useQueryClient();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filterQuery, setFilterQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectedTaskIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedTaskIdRef.current = selectedTask?.id || null;
  }, [selectedTask]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  // Deep linking for tasks
  useEffect(() => {
    const taskIdParam = searchParams.get('taskId');
    const createTaskParam = searchParams.get('createTask');
    
    if (taskIdParam && tasks && !tLoading) {
      const task = tasks.find(t => t.id === taskIdParam);
      if (task) {
        setSelectedTask(task);
        setModalOpen(true);
      }
    } else if (createTaskParam === 'true') {
      setSelectedTask(null);
      setModalOpen(true);
    }
  }, [searchParams, tasks, tLoading]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  useEffect(() => {
    // Only attempt to connect and join the project room if the REST API successfully authorized the user
    // and loaded the project data. This prevents rate-limit retry loops when authorization fails.
    if (!projectId || pError || !project) return;

    const socket = socketClient.connect();

    // Authenticate and join room
    socket.emit('join_project', projectId, (response: any) => {
      if (!response.success) {
        console.error('Failed to join project room:', response.error);
      }
    });

    // Reconnection handling: invalidates queries to fetch latest state
    const onReconnect = () => {
      socket.emit('join_project', projectId);
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['activity', projectId] });
      if (selectedTaskIdRef.current) {
        queryClient.invalidateQueries({ queryKey: ['comments', selectedTaskIdRef.current] });
      }
    };
    socket.io.on('reconnect', onReconnect);

    // Event Listeners for Tasks
    socket.on('task:created', (task: Task) => {
      queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) => {
        if (!old) return [task];
        if (old.some(t => t.id === task.id)) return old;
        return [...old, task];
      });
    });
    
    socket.on('task:updated', (task: Task) => {
      queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) => 
        old ? old.map(t => t.id === task.id ? task : t) : undefined
      );
      if (selectedTaskIdRef.current === task.id) {
        setSelectedTask(task);
      }
    });
    
    socket.on('task:deleted', ({ id }: { id: string }) => {
      queryClient.setQueryData(['tasks', projectId], (old: Task[] | undefined) => 
        old ? old.filter(t => t.id !== id) : undefined
      );
      if (selectedTaskIdRef.current === id) {
        setModalOpen(false);
      }
    });

    // Event Listeners for Comments
    socket.on('comment:created', (comment: Comment) => {
      queryClient.setQueryData(['comments', comment.task_id], (old: Comment[] | undefined) => {
        if (!old) return [comment];
        if (old.some(c => c.id === comment.id)) return old;
        return [...old, comment];
      });
    });

    socket.on('comment:updated', (comment: Comment) => {
      queryClient.setQueryData(['comments', comment.task_id], (old: Comment[] | undefined) => 
        old ? old.map(c => c.id === comment.id ? comment : c) : undefined
      );
    });

    socket.on('comment:deleted', () => {
      // Invalidate because we don't have task_id in the deleted payload
      // Alternatively, we could invalidate all comments, or wait for activity to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    });

    // Event Listeners for Activity
    socket.on('activity:created', (activity: Activity) => {
      queryClient.setQueryData(['activity', projectId], (old: Activity[] | undefined) => {
        if (!old) return [activity];
        if (old.some(a => a.id === activity.id)) return old;
        return [activity, ...old].slice(0, 50);
      });
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('comment:created');
      socket.off('comment:updated');
      socket.off('comment:deleted');
      socket.off('activity:created');
      socket.io.off('reconnect', onReconnect);
      socket.emit('leave_project', projectId);
      socketClient.disconnect();
    };
  }, [projectId, project, pError, queryClient]);

  if (pLoading) return <div className="p-8 text-center">Loading project...</div>;
  if (pError || !project) return <div className="p-8 text-center text-red-600">Project not found or unauthorized</div>;

  return (
    <div className="h-full flex flex-col font-sans overflow-hidden bg-background">
      {/* Project Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 shrink-0 bg-white">
        <div className="flex items-center space-x-3">
          <Link to={`/workspaces/${project.workspace_id}`} className="text-sm font-medium text-gray-500 hover:text-primary-700 transition-colors">
            {project.name}
          </Link>
          <span className="text-gray-300">/</span>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">Project Board</h2>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Project Header Summary */}
          {!tLoading && tasks && (
            <div className="hidden md:flex items-center space-x-4 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-medium text-gray-900">{tasks.length}</span>
                <span className="text-xs text-gray-500 font-medium">tasks</span>
              </div>
              <span className="text-gray-300">·</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-medium text-amber-600">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
                <span className="text-xs text-gray-500 font-medium">in progress</span>
              </div>
              <span className="text-gray-300">·</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-medium text-emerald-600">{tasks.filter(t => t.status === 'DONE').length}</span>
                <span className="text-xs text-gray-500 font-medium">completed</span>
              </div>
              <span className="text-gray-300">·</span>
              <ConnectionStatus />
            </div>
          )}

          <ProjectMembers projectId={projectId!} workspaceId={project.workspace_id} />

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Project Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>

          <div className="flex items-center space-x-2 border-l border-gray-200 pl-6 ml-2">
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              className="hidden md:block h-9 text-sm border-gray-200 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="ALL">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            <input 
              type="text" 
              placeholder="Filter tasks..." 
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              className="hidden md:block h-9 w-40 text-sm border-gray-200 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            <Button onClick={handleCreateTask}>
              Create Task
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 p-6 overflow-hidden">
          {/* Kanban Container */}

          <div className="flex-1 overflow-hidden min-h-0 bg-gray-50/50 rounded-xl border border-gray-200 shadow-inner">
            {tLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Loading tasks...</div>
            ) : (
              <KanbanBoard 
                projectId={projectId!} 
                tasks={tasks?.filter(t => {
                  if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
                  if (filterQuery && !t.title.toLowerCase().includes(filterQuery.toLowerCase())) return false;
                  return true;
                }) || []} 
                onTaskClick={handleTaskClick} 
              />
            )}
          </div>
        </div>

        <ActivityFeed projectId={projectId!} />
      </main>

      {modalOpen && (
        <TaskModal 
          projectId={projectId!} 
          task={selectedTask} 
          onClose={() => {
            setModalOpen(false);
            if (searchParams.has('taskId') || searchParams.has('createTask')) {
              setSearchParams(prev => {
                prev.delete('taskId');
                prev.delete('createTask');
                return prev;
              }, { replace: true });
            }
          }}
        />
      )}

      {project && (
        <ProjectSettingsModal 
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          project={project}
        />
      )}
    </div>
  );
};
