import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../api';
import { useCreateTask, useUpdateTask, useDeleteTask } from '../queries';
import { useProjectMembers } from '../../projects/queries';
import { CommentSection } from '../../comments/components/CommentSection';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import { useConfirm } from '../../../components/ui/ConfirmationDialog';

interface TaskModalProps {
  projectId: string;
  task?: Task | null; // null means create new
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ projectId, task, onClose }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'MEDIUM');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'TODO');
  const [dueDate, setDueDate] = useState(task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
  const [assigneeId, setAssigneeId] = useState<string>(task?.assignee?.id || '');

  const { data: projectMembers } = useProjectMembers(projectId);
  const createMutation = useCreateTask(projectId);
  const updateMutation = useUpdateTask(projectId);
  const deleteMutation = useDeleteTask(projectId);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const isEditing = !!task;
  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description: description || null,
      priority,
      status,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      assignee_id: assigneeId || null,
    };

    if (isEditing) {
      updateMutation.mutate(
        { taskId: task.id, data: payload },
        { 
          onSuccess: () => {
            toast('Task updated successfully', 'success');
            onClose();
          } 
        }
      );
    } else {
      createMutation.mutate(payload, { 
        onSuccess: () => {
          toast('Task created successfully', 'success');
          onClose();
        } 
      });
    }
  };

  const handleDelete = () => {
    confirm({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete Task',
      onConfirm: () => {
        deleteMutation.mutate(task!.id, { 
          onSuccess: () => {
            toast('Task deleted successfully', 'success');
            onClose();
          } 
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-300 border-l border-gray-200">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${isEditing ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isEditing ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"}></path></svg>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-gray-900">
              {isEditing ? 'Task Details' : 'Create Task'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/30">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
              <Input
                label="Title"
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="text-lg font-medium"
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Add details, links, and context..."
                  className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow resize-y"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-6">
                <Input
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={e => setAssigneeId(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  >
                    <option value="">Unassigned</option>
                    {projectMembers?.map(member => (
                      <option key={member.user.id} value={member.user.id}>
                        {member.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete Task
                </button>
              ) : <div></div>}
              
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>

        {isEditing && (
          <div className="px-8 pb-8 bg-gray-50/50 mt-auto border-t border-gray-100 pt-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity & Comments</h3>
            <CommentSection taskId={task.id} />
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
