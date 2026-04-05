'use client';
import { useState, useEffect } from 'react';
import {
    DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Paperclip, MessageSquare, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

const COLUMNS = [
    { id: 'TODO', label: 'To Do', color: 'bg-slate-100 text-slate-700', headerColor: 'bg-slate-200' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800', headerColor: 'bg-blue-100' },
    { id: 'IN_REVIEW', label: 'In Review', color: 'bg-purple-100 text-purple-800', headerColor: 'bg-purple-100' },
    { id: 'DONE', label: 'Done', color: 'bg-green-100 text-green-800', headerColor: 'bg-green-100' },
    { id: 'ON_HOLD', label: 'On Hold', color: 'bg-orange-100 text-orange-800', headerColor: 'bg-orange-100' },
];

const PRIORITY_CONFIG = {
    URGENT: { label: 'Urgent', class: 'bg-red-100 text-red-700' },
    HIGH: { label: 'High', class: 'bg-orange-100 text-orange-700' },
    MEDIUM: { label: 'Medium', class: 'bg-yellow-100 text-yellow-700' },
    LOW: { label: 'Low', class: 'bg-gray-100 text-gray-600' },
};

function TaskCard({ task, isDragging = false, onClick }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG];
    const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={cn(
                'bg-white rounded-xl border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group',
                isDragging && 'opacity-50 rotate-2',
                isOverdue && 'border-l-4 border-l-red-500'
            )}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-medium text-sm text-gray-900 line-clamp-2">{task.title}</p>
                <Badge variant="outline" className={cn('text-xs shrink-0', priority?.class)}>
                    {priority?.label}
                </Badge>
            </div>
            {task.client && (
                <p className="text-xs text-gray-500 mb-2 truncate">{task.client.name}</p>
            )}
            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    {task.dueDate && (
                        <span className={cn('flex items-center gap-1', isOverdue && 'text-red-500 font-medium')}>
                            {isOverdue && <AlertCircle size={10} />}
                            <Calendar size={10} />
                            {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                    )}
                    {task._count?.attachments > 0 && (
                        <span className="flex items-center gap-1">
                            <Paperclip size={10} /> {task._count.attachments}
                        </span>
                    )}
                    {task._count?.comments > 0 && (
                        <span className="flex items-center gap-1">
                            <MessageSquare size={10} /> {task._count.comments}
                        </span>
                    )}
                </div>
                {task.assignedTo && (
                    <Avatar className="h-5 w-5">
                        <AvatarImage src={task.assignedTo.avatarUrl} />
                        <AvatarFallback className="text-[8px]">{task.assignedTo.name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                )}
            </div>
        </div>
    );
}

export function KanbanBoard({ tasks, onTaskClick }: { tasks: any[]; onTaskClick: (t: any) => void }) {
    const queryClient = useQueryClient();
    const [localTasks, setLocalTasks] = useState(tasks);
    const [activeTask, setActiveTask] = useState<any>(null);

    useEffect(() => setLocalTasks(tasks), [tasks]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const updateStatus = useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
            await fetch(`/api/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        onError: () => setLocalTasks(tasks),
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        if (!over) return;
        const newStatus = over.id as string;
        if (COLUMNS.some(c => c.id === newStatus)) {
            const task = localTasks.find(t => t.id === active.id);
            if (task && task.status !== newStatus) {
                setLocalTasks(prev => prev.map(t => t.id === active.id ? { ...t, status: newStatus } : t));
                updateStatus.mutate({ taskId: active.id as string, status: newStatus });
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={e => setActiveTask(localTasks.find(t => t.id === e.active.id))}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 h-full">
                {COLUMNS.map(col => {
                    const colTasks = localTasks.filter(t => t.status === col.id);
                    return (
                        <div key={col.id} className="flex-shrink-0 w-72 flex flex-col">
                            <div className={cn('flex items-center justify-between px-3 py-2 rounded-t-xl mb-2', col.headerColor)}>
                                <span className={cn('text-xs font-semibold', col.color.split(' ')[1])}>{col.label}</span>
                                <span className="text-xs text-gray-400 font-medium">{colTasks.length}</span>
                            </div>
                            <SortableContext id={col.id} items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                <div className="flex-1 space-y-2 min-h-32 p-2 bg-gray-50 rounded-b-xl rounded-tr-xl border border-gray-100">
                                    {colTasks.map(task => (
                                        <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                                    ))}
                                    {colTasks.length === 0 && (
                                        <div className="text-center py-8 text-gray-300 text-xs border-2 border-dashed border-gray-200 rounded-lg">
                                            Drop tasks here
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </div>
                    );
                })}
            </div>
            <DragOverlay>
                {activeTask && <TaskCard task={activeTask} isDragging />}
            </DragOverlay>
        </DndContext>
    );
}
