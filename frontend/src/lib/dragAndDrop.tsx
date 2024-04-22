import { useDraggable } from '@dnd-kit/core';
import { Post } from '@/sharedDataModel';
import { cn } from './utils';
import { ID } from 'jazz-tools';

export function Draggable({
  children,
  postId,
  className,
}: {
  children: React.ReactNode;
  postId: ID<Post>;
  className: string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: postId,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(className, { 'opacity-30': isDragging })}
    >
      {children}
    </div>
  );
}
