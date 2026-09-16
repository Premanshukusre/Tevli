import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../features/workspaces/queries';
import { useProjectsByWorkspace, useToggleStarProject } from '../features/projects/queries';
import { useTasks } from '../features/tasks/queries';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { getThemeForString } from '../lib/color';
import { CardSkeleton } from '../components/ui/Skeleton';
import { WorkspaceMembers } from '../features/workspaces/components/WorkspaceMembers';

export const WorkspaceDetails = () => {
  const { workspaceId } = useParams();
  const { data: workspace, isLoading: wsLoading, isError: wsError } = useWorkspace(workspaceId!);
  const { data: projects, isLoading: pLoading } = useProjectsByWorkspace(workspaceId!);
  const [, setSearchParams] = useSearchParams();
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  if (wsLoading) return <div className="p-8 text-center">Loading workspace...</div>;
  if (wsError || !workspace) return <div className="p-8 text-center text-red-600">Workspace not found</div>;

  const handleCreateProject = () => {
    setSearchParams(prev => { prev.set('createProject', 'true'); return prev; });
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Projects in {workspace.name}</h2>
          <p className="text-sm text-gray-500 mt-1">Select a project to view its Kanban board and activity</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="secondary"
            onClick={() => setMembersModalOpen(true)}
          >
            Manage Members
          </Button>
          <Link to={`/workspaces/${workspaceId}/settings`}>
            <Button variant="secondary">
              Settings
            </Button>
          </Link>
          <Button 
            onClick={handleCreateProject}
          >
            Create Project
          </Button>
        </div>
      </div>

      {pLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : projects?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center bg-gray-50/50">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">Create your first project in this workspace to start managing tasks.</p>
          <Button 
            variant="secondary"
            onClick={handleCreateProject}
          >
            Create First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {membersModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Workspace Members</h2>
              <button 
                onClick={() => setMembersModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <WorkspaceMembers workspaceId={workspaceId!} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ project }: { project: { id: string; name: string; created_at: string; is_starred?: boolean } }) => {
  const { data: tasks, isLoading } = useTasks(project.id);
  const toggleStar = useToggleStarProject();

  const handleStarToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStar.mutate({ id: project.id, isStarred: !project.is_starred });
  };

  const todoCount = tasks?.filter(t => t.status === 'TODO').length || 0;
  const inProgressCount = tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0;
  const doneCount = tasks?.filter(t => t.status === 'DONE').length || 0;

  return (
    <Link to={`/projects/${project.id}`} className="block group h-full">
      <Card className="h-full transition-all hover:border-gray-400 hover:shadow-sm flex flex-col">
        <CardHeader className="flex flex-row items-start space-x-4 pb-4 shrink-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-base font-semibold transition-colors shrink-0 shadow-sm ${getThemeForString(project.name)}`}>
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <CardTitle className="group-hover:text-primary-700 transition-colors line-clamp-2 leading-tight pr-2">
                {project.name}
              </CardTitle>
              <button 
                onClick={handleStarToggle}
                className="p-1 -mt-1 -mr-1 rounded-full hover:bg-gray-100 transition-colors"
                title={project.is_starred ? "Unstar project" : "Star project"}
              >
                <svg className={`w-5 h-5 transition-colors ${project.is_starred ? 'text-amber-400 fill-current' : 'text-gray-300 group-hover:text-amber-400'}`} viewBox="0 0 24 24" fill={project.is_starred ? 'currentColor' : 'none'} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 font-medium">
              Created {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col border-t border-gray-100 pt-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {isLoading ? 'Loading tasks...' : `${tasks?.length || 0} Task${tasks?.length !== 1 ? 's' : ''}`}
          </div>
          
          {!isLoading && tasks && tasks.length > 0 && (
            <div className="flex space-x-4 mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">To Do</span>
                <span className="text-sm font-semibold text-gray-700">{todoCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">In Progress</span>
                <span className="text-sm font-semibold text-gray-700">{inProgressCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Done</span>
                <span className="text-sm font-semibold text-gray-700">{doneCount}</span>
              </div>
            </div>
          )}

          <div className="mt-auto pt-2">
            <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700">Open Project &rarr;</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
