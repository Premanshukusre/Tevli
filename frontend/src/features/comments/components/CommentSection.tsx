import { useState } from 'react';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '../queries';
import { Comment } from '../api';
import { useUser } from '../../auth/queries';
import { Button } from '../../../components/ui/Button';

export const CommentSection = ({ taskId }: { taskId: string }) => {
  const { data: user } = useUser();
  const { data: comments, isLoading } = useComments(taskId);
  const createMutation = useCreateComment(taskId);
  const updateMutation = useUpdateComment(taskId);
  const deleteMutation = useDeleteComment(taskId);

  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createMutation.mutate(newComment, {
      onSuccess: () => setNewComment('')
    });
  };

  const handleUpdate = (id: string) => {
    if (!editContent.trim()) return;
    updateMutation.mutate({ commentId: id, content: editContent }, {
      onSuccess: () => {
        setEditingId(null);
        setEditContent('');
      }
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000); // in seconds
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="pt-2">
      <h3 className="text-sm font-semibold tracking-tight text-gray-900 mb-4">Comments</h3>
      
      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading comments...</div>
      ) : comments?.length === 0 ? (
        <div className="text-gray-500 text-sm mb-6">No comments yet.</div>
      ) : (
        <div className="space-y-5 mb-6">
          {comments?.map((c: Comment) => (
            <div key={c.id} className="group">
              <div className="flex justify-between items-baseline mb-1">
                <div className="font-medium text-gray-900 text-sm">{c.user.name}</div>
                <div className="text-xs text-gray-400">{formatTime(c.created_at)}</div>
              </div>
              
              {editingId === c.id ? (
                <div className="mt-2">
                  <textarea 
                    className="w-full border border-gray-200 rounded-md shadow-sm text-sm p-2 focus:ring-1 focus:ring-primary-500 outline-none transition-shadow"
                    rows={2}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                  />
                  <div className="mt-2 flex space-x-2">
                    <Button size="sm" onClick={() => handleUpdate(c.id)}>Save</Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{c.content}</div>
              )}

              {user?.id === c.user_id && editingId !== c.id && (
                <div className="mt-2 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingId(c.id); setEditContent(c.content); }}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => { if(confirm('Delete comment?')) deleteMutation.mutate(c.id); }}
                    className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleCreate}>
        <textarea
          placeholder="Write a comment..."
          className="w-full border border-gray-200 rounded-md text-sm p-3 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-shadow bg-white placeholder:text-gray-400 resize-none"
          rows={3}
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <Button 
            type="submit" 
            disabled={createMutation.isPending || !newComment.trim()}
          >
            {createMutation.isPending ? 'Sending...' : 'Comment'}
          </Button>
        </div>
      </form>
    </div>
  );
};
