import React from 'react';
import { CreateModal } from '../../../components/ui/CreateModal';
import { useCreateWorkspace } from '../queries';
import { useToast } from '../../../components/ui/Toast';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (workspaceId: string) => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const mutation = useCreateWorkspace();
  const { toast } = useToast();

  const handleSubmit = async (name: string) => {
    return new Promise<void>((resolve, reject) => {
      mutation.mutate({ name }, {
        onSuccess: (data) => {
          toast('Workspace created successfully', 'success');
          onSuccess(data.id);
          resolve();
        },
        onError: (error: any) => {
          reject(new Error(error.message || 'Failed to create workspace'));
        }
      });
    });
  };

  return (
    <CreateModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Workspace"
      label="Workspace Name"
      placeholder="e.g. Acme Corp, Design Team"
      submitText="Create Workspace"
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
    />
  );
};
