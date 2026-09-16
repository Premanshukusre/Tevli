import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { getThemeForString } from '../lib/color';
import { useStarredProjects, useToggleStarProject } from '../features/projects/queries';

export const Starred = () => {
  const { data: starredProjects, isLoading } = useStarredProjects();
  const toggleStar = useToggleStarProject();

  const handleToggle = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStar.mutate({ id: projectId, isStarred: false });
  };

  if (isLoading) return <div className="p-8 text-center">Loading starred projects...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-8 animate-in fade-in duration-200">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Starred</h2>
        <p className="text-sm text-gray-500 mt-1">Your favorite projects for quick access</p>
      </div>

      {!starredProjects || starredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center bg-gray-50/50">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No starred projects</h3>
          <p className="text-sm text-gray-500">Star a project to keep it here for quick access.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {starredProjects.map((project: any) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="block group">
              <Card className="h-full transition-all hover:border-gray-400 hover:shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-semibold shadow-sm ${getThemeForString(project.name)}`}>
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">{project.name}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate">{project.workspace?.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleToggle(e, project.id)}
                    className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-amber-400 fill-current hover:opacity-75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                  </button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
