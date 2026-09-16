import React, { useState } from 'react';
import { useProjectMembers, useAddProjectMember, useRemoveProjectMember } from '../queries';
import { ProjectMember } from '../api';
import { useWorkspaceMembers } from '../../workspaces/queries';
import { useUser } from '../../auth/queries';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../components/ui/Toast';

export const ProjectMembers = ({ projectId, workspaceId }: { projectId: string; workspaceId: string }) => {
  const { data: members, isLoading } = useProjectMembers(projectId);
  const { data: workspaceMembers } = useWorkspaceMembers(workspaceId);
  const { data: currentUser } = useUser();
  const addMemberMutation = useAddProjectMember(projectId);
  const removeMemberMutation = useRemoveProjectMember(projectId);
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');

  const currentMemberRole = members?.find(m => m.user_id === currentUser?.id)?.role;
  const isAdmin = currentMemberRole === 'ADMIN';

  if (isLoading || !members) return null;

  // Filter workspace members that are not already in the project
  const availableWorkspaceMembers = workspaceMembers?.filter(
    wm => !members.some(pm => pm.user_id === wm.user_id)
  ) || [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedUserId) return;

    try {
      await addMemberMutation.mutateAsync(selectedUserId);
      setSelectedUserId('');
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    }
  };

  const handleRemove = async (member: ProjectMember) => {
    if (member.role === 'ADMIN' && members.filter(m => m.role === 'ADMIN').length === 1) {
      toast('Each project must retain at least one admin.', 'error');
      return;
    }
    
    if (confirm(`Are you sure you want to remove ${member.user.name}?`)) {
      try {
        await removeMemberMutation.mutateAsync(member.user_id);
      } catch (err: any) {
        toast(err.message || 'Failed to remove member', 'error');
      }
    }
  };

  return (
    <>
      <div 
        className="flex -space-x-2 overflow-hidden mr-4 cursor-pointer hover:opacity-80 transition-opacity items-center"
        onClick={() => setModalOpen(true)}
        title="Manage Project Members"
      >
        {members.slice(0, 4).map((member, i) => (
          <div 
            key={member.user_id} 
            className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700"
            style={{ zIndex: 10 - i }}
            title={member.user.name}
          >
            {member.user.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {members.length > 4 && (
          <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600" style={{ zIndex: 0 }}>
            +{members.length - 4}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Project Members</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
              {isAdmin ? (
                <form onSubmit={handleAdd} className="flex gap-2">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={addMemberMutation.isPending}
                  >
                    <option value="">Select workspace member...</option>
                    {availableWorkspaceMembers.map(wm => (
                      <option key={wm.user_id} value={wm.user_id}>{wm.user.name} ({wm.user.email})</option>
                    ))}
                  </select>
                  <Button type="submit" disabled={!selectedUserId || addMemberMutation.isPending}>
                    {addMemberMutation.isPending ? 'Adding...' : 'Add'}
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-gray-500">Only project admins can add new members.</p>
              )}
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              <ul className="divide-y divide-gray-100">
                {members.map(member => (
                  <li key={member.user_id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs shrink-0">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          {member.user.name}
                          {member.user_id === currentUser?.id && <span className="text-[10px] bg-gray-100 text-gray-500 px-1 ml-2 rounded">You</span>}
                        </p>
                        <p className="text-xs text-gray-500">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-medium">{member.role}</span>
                      {(isAdmin || member.user_id === currentUser?.id) && (
                        <button
                          onClick={() => handleRemove(member)}
                          disabled={removeMemberMutation.isPending}
                          className="text-red-400 hover:text-red-600 p-1"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
