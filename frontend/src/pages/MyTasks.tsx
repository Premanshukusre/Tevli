import { useMyTasks } from '../features/tasks/queries';
import { Card, CardContent } from '../components/ui/Card';
import { Link } from 'react-router-dom';

export const MyTasks = () => {
  const { data: tasks, isLoading, isError } = useMyTasks();

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-10 px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">My Tasks</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-center text-red-600">Failed to load your tasks.</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-8 animate-in fade-in duration-200">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">My Tasks</h2>
        <p className="text-sm text-gray-500 mt-1">Tasks assigned to you across all projects</p>
      </div>

      {!tasks || tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center bg-gray-50/50">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned tasks</h3>
          <p className="text-sm text-gray-500">You don't have any tasks assigned to you right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <Card key={task.id} className="hover:border-primary-200 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'DONE' ? 'bg-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                      <Link to={`/projects/${task.project_id}`} className="hover:text-primary-600 transition-colors">
                        {task.project?.name || 'Unknown Project'}
                      </Link>
                      {task.due_date && (
                        <span className="flex items-center text-amber-600">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 shrink-0 ml-4">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                    task.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                    task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {task.priority}
                  </span>
                  <Link to={`/projects/${task.project_id}?task=${task.id}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">Open &rarr;</Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
