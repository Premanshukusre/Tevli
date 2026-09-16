import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '../api';
import { useUpdateTask } from '../queries';
import { Calendar } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, tasks, onTaskClick }) => {
  const updateTask = useUpdateTask(projectId);
  
  // Local state for optimistic UI during drag
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Sync local tasks when server tasks change (unless dragging)
  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return; // Dropped in the same spot
    }

    const task = localTasks.find(t => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId as TaskStatus;
    
    // Create a new array to calculate positions
    const newLocalTasks = Array.from(localTasks);
    // Remove the dragged task
    const [movedTask] = newLocalTasks.splice(newLocalTasks.findIndex(t => t.id === draggableId), 1);
    
    // Get tasks in the destination column (excluding the dragged task)
    const destTasks = newLocalTasks
      .filter(t => t.status === newStatus)
      .sort((a, b) => a.position - b.position);

    let newPosition = 0;
    
    if (destTasks.length === 0) {
      newPosition = 1024;
    } else if (destination.index === 0) {
      newPosition = destTasks[0].position / 2;
    } else if (destination.index >= destTasks.length) {
      newPosition = destTasks[destTasks.length - 1].position + 1024;
    } else {
      const prev = destTasks[destination.index - 1].position;
      const next = destTasks[destination.index].position;
      newPosition = (prev + next) / 2;
    }

    // Update optimistic state
    movedTask.status = newStatus;
    movedTask.position = newPosition;
    newLocalTasks.push(movedTask);
    setLocalTasks(newLocalTasks);

    // Persist to server
    updateTask.mutate({
      taskId: draggableId,
      data: { status: newStatus, position: newPosition }
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-6 items-start h-full pb-4 overflow-x-auto">
        {COLUMNS.map(column => {
          const columnTasks = localTasks
            .filter(t => t.status === column.id)
            .sort((a, b) => a.position - b.position);

          return (
            <div key={column.id} className={`rounded-none border-r border-gray-200 last:border-r-0 w-full md:w-[320px] flex-shrink-0 flex flex-col max-h-full ${
              column.id === 'IN_PROGRESS' ? 'bg-primary-50/30' :
              column.id === 'DONE' ? 'bg-emerald-50/30' : 'bg-transparent'
            }`}>
              <div className={`p-3 mb-2 font-semibold flex justify-between items-center ${
                column.id === 'IN_PROGRESS' ? 'text-primary-800' :
                column.id === 'DONE' ? 'text-emerald-700' : 'text-gray-900'
              }`}>
                <span className="tracking-tight">{column.title}</span>
                <span className={`text-sm font-normal ${
                  column.id === 'IN_PROGRESS' ? 'text-primary-500' :
                  column.id === 'DONE' ? 'text-emerald-500' : 'text-gray-400'
                }`}>
                  {columnTasks.length}
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`px-3 pb-3 flex-1 min-h-[150px] overflow-y-auto rounded-md transition-colors ${
                      snapshot.isDraggingOver ? (
                        column.id === 'IN_PROGRESS' ? 'bg-primary-50' :
                        column.id === 'DONE' ? 'bg-emerald-50' : 'bg-gray-50'
                      ) : ''
                    }`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick(task)}
                            className="mb-3 outline-none"
                          >
                              <Card className={`p-4 cursor-grab active:cursor-grabbing transition-all duration-200 border-l-4 ${
                                column.id === 'DONE' ? 'border-l-emerald-500 bg-emerald-50/10' :
                                column.id === 'IN_PROGRESS' ? 'border-l-primary-500' :
                                'border-l-gray-300'
                              } ${
                                snapshot.isDragging 
                                  ? 'shadow-xl ring-2 ring-primary-500 scale-105 rotate-1 z-50' 
                                  : 'hover:shadow-md hover:-translate-y-0.5 border border-gray-200 hover:border-gray-300'
                              }`}>
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className={`font-medium text-sm leading-snug break-words ${column.id === 'DONE' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{task.title}</h4>
                                </div>
                              
                              <div className="flex flex-wrap items-center gap-2 mt-3">
                                <Badge variant={
                                  task.priority === 'HIGH' ? 'red' : 
                                  task.priority === 'MEDIUM' ? 'amber' : 'slate'
                                }>
                                  {task.priority}
                                </Badge>
                                
                                {task.due_date && (
                                  <span className={`flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded ${
                                    new Date(task.due_date) < new Date(new Date().setHours(0,0,0,0)) && column.id !== 'DONE'
                                      ? 'bg-rose-100 text-rose-700' 
                                      : new Date(task.due_date).toDateString() === new Date().toDateString() && column.id !== 'DONE'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'text-gray-500'
                                  }`}>
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                              
                              {task.assignee && (
                                <div className="mt-4 flex justify-end">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-white shadow-sm ring-1 ring-gray-100 text-white bg-primary-600" title={task.assignee.name}>
                                    {task.assignee.name.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                              )}
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
