import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { getThemeForString } from '../lib/color';
import { useRecentProjects } from '../features/projects/queries';

export const Recent = () => {
  const { data: recentProjects, isLoading } = useRecentProjects();

  if (isLoading) return <div className="p-8 text-center">Loading recent projects...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-8 animate-in fade-in duration-200">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Recent</h2>
        <p className="text-sm text-gray-500 mt-1">Recently accessed projects</p>
      </div>

      {!recentProjects || recentProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center bg-gray-50/50">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
          <p className="text-sm text-gray-500">You haven't opened any projects recently.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProjects.map((project: any) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="block group">
              <Card className="h-full transition-all hover:border-gray-400 hover:shadow-sm">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-semibold shadow-sm ${getThemeForString(project.name)}`}>
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">{project.name}</p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{project.workspace?.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Accessed {new Date(project.last_accessed).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
