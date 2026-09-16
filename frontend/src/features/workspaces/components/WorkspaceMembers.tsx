import React, { useState } from 'react';
import { useWorkspaceMembers, useAddWorkspaceMember, useRemoveWorkspaceMember } from '../queries';
import { WorkspaceMember } from '../api';
import { useUser } from '../../auth/queries';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';

export const WorkspaceMembers = ({ workspaceId }: { workspaceId: string }) => {
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);
  const { data: currentUser } = useUser();
  const addMemberMutation = useAddWorkspaceMember(workspaceId);
  const removeMemberMutation = useRemoveWorkspaceMember(workspaceId);
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const currentMemberRole = members?.find(m => m.user_id === currentUser?.id)?.role;
  const isAdmin = currentMemberRole === 'ADMIN';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) return;

    try {
      await addMemberMutation.mutateAsync(email);
      setEmail('');
      setIsAdding(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    }
  };

  const handleRemove = async (member: WorkspaceMember) => {
    if (member.role === 'ADMIN' && members?.filter(m => m.role === 'ADMIN').length === 1) {
      toast('Each workspace must retain at least one admin.', 'error');
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

  if (isLoading) return <div className="text-sm text-gray-500 py-4">Loading members...</div>;
  if (!members) return null;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Workspace Members</h3>
          <p className="text-sm text-gray-500 mt-1">Manage team access and roles.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'primary'}>
            {isAdding ? 'Cancel' : 'Add Member'}
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col md:flex-row gap-4 items-start md:items-center animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-1 w-full">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="max-w-md"
              disabled={addMemberMutation.isPending}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <Button type="submit" disabled={addMemberMutation.isPending || !email.trim()}>
            {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
          </Button>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {members.map(member => (
            <li key={member.user_id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold shrink-0">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {member.user.name}
                    {member.user_id === currentUser?.id && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">You</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${member.role === 'ADMIN' ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                  {member.role}
                </span>
                {(isAdmin || member.user_id === currentUser?.id) && (
                  <button
                    onClick={() => handleRemove(member)}
                    disabled={removeMemberMutation.isPending}
                    className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                    title="Remove member"
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
  );
};
