import React, { useState, useEffect } from 'react';
import { useUpdateProject, useDeleteProject } from '../queries';
import { useToast } from '../../../components/ui/Toast';
import { useConfirm } from '../../../components/ui/ConfirmationDialog';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Project } from '../api';
import { useNavigate } from 'react-router-dom';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  project 
}) => {
  const updateMutation = useUpdateProject(project.id);
  const deleteMutation = useDeleteProject();
  
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const [name, setName] = useState(project.name);

  // Reset name when project changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(project.name);
    }
  }, [isOpen, project.name]);

  if (!isOpen) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    updateMutation.mutate(
      { name },
      {
        onSuccess: () => {
          toast('Project renamed successfully', 'success');
          onClose();
        },
        onError: (err: any) => {
          toast(err.message || 'Failed to rename project', 'error');
        }
      }
    );
  };

  const handleDelete = () => {
    onClose(); // Close this modal to prevent z-index issues with confirm dialog
    
    confirm({
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"? This action cannot be undone and all tasks will be lost.`,
      variant: 'danger',
      confirmText: 'Delete Project',
      onConfirm: () => {
        deleteMutation.mutate(project.id, {
          onSuccess: () => {
            toast('Project deleted successfully', 'success');
            navigate(`/workspaces/${project.workspace_id}`);
          },
          onError: (err: any) => {
            toast(err.message || 'Failed to delete project', 'error');
          }
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Project Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Input
                label="Project Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            
            {updateMutation.isError && (
              <div className="text-sm text-rose-600">
                {(updateMutation.error as Error).message}
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending || name === project.name}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-rose-600 mb-1">Danger Zone</h3>
            <p className="text-sm text-gray-500 mb-4">Once you delete a project, there is no going back. Please be certain.</p>
            <Button 
              type="button" 
              variant="danger" 
              onClick={handleDelete}
              className="w-full"
            >
              Delete Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
