import React from 'react';
import { CreateModal } from '../../../components/ui/CreateModal';
import { useCreateProject } from '../queries';
import { useToast } from '../../../components/ui/Toast';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName?: string;
  onSuccess: (projectId: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  workspaceId, 
  workspaceName,
  onSuccess 
}) => {
  const mutation = useCreateProject();
  const { toast } = useToast();

  const handleSubmit = async (name: string) => {
    return new Promise<void>((resolve, reject) => {
      mutation.mutate({ workspaceId, name }, {
        onSuccess: (data) => {
          toast('Project created successfully', 'success');
          onSuccess(data.id);
          resolve();
        },
        onError: (error: any) => {
          reject(new Error(error.message || 'Failed to create project'));
        }
      });
    });
  };

  return (
    <CreateModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Project"
      label="Project Name"
      placeholder="e.g. Q3 Marketing, Redesign"
      contextMessage={workspaceName ? `Creating in ${workspaceName}` : undefined}
      submitText="Create Project"
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
    />
  );
};
