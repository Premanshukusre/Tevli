import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from '../features/workspaces/queries';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { useConfirm } from '../components/ui/ConfirmationDialog';

export const WorkspaceSettings = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { data: workspace, isLoading } = useWorkspace(workspaceId!);
  
  const updateMutation = useUpdateWorkspace(workspaceId!);
  const deleteMutation = useDeleteWorkspace();
  
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [name, setName] = useState(workspace?.name || '');

  if (isLoading) return <div className="p-8 text-center">Loading settings...</div>;
  if (!workspace) return <div className="p-8 text-center text-red-600">Workspace not found</div>;

  // Sync state if workspace loads after initial render
  if (workspace && workspace.name !== name && !name && !updateMutation.isPending) {
    setName(workspace.name);
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    updateMutation.mutate(
      { name },
      {
        onSuccess: () => {
          toast('Workspace renamed successfully', 'success');
        },
        onError: (err: any) => {
          toast(err.message || 'Failed to rename workspace', 'error');
        }
      }
    );
  };

  const handleDelete = () => {
    confirm({
      title: 'Delete Workspace',
      message: `Are you sure you want to delete "${workspace.name}"? This action cannot be undone and all projects and tasks will be lost.`,
      variant: 'danger',
      confirmText: 'Delete Workspace',
      onConfirm: () => {
        deleteMutation.mutate(workspaceId!, {
          onSuccess: () => {
            toast('Workspace deleted successfully', 'success');
            navigate('/workspaces');
          },
          onError: (err: any) => {
            toast(err.message || 'Failed to delete workspace', 'error');
          }
        });
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-8 animate-in fade-in duration-200">
      <div className="mb-10">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Workspace Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your workspace details and preferences</p>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-900">General</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleUpdate} className="max-w-md space-y-4">
              <Input
                label="Workspace Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <Button type="submit" disabled={updateMutation.isPending || (workspace && name === workspace.name)}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white border border-rose-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/50">
            <h3 className="text-base font-semibold text-rose-900">Danger Zone</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Delete this workspace</h4>
                <p className="text-sm text-gray-500 mt-1">Once deleted, it will be gone forever. Please be certain.</p>
              </div>
              <Button 
                variant="danger" 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Workspace'}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
