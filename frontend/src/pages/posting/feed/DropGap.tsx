import { ISODate } from '@/sharedDataModel';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

export function DropGap({
  before,
  after,
  isLeft,
}: {
  before?: ISODate;
  after?: ISODate;
  isLeft?: boolean;
}) {
  const { isOver, setNodeRef, active } = useDroppable({
    id: 'dropGap-' + after + '-' + before,
    data: { after, before },
  });

  return (
    active && (
      <div
        ref={setNodeRef}
        className={
          'absolute top-0 bottom-0 w-20 z-10 flex justify-center items-center ' +
          (isLeft ? '-left-10' : '-right-10')
        }
      >
        <div
          className={cn('h-[80%] rounded', {
            'w-1': isOver,
            'w-px': !isOver,
            'bg-neutral-500': !isOver,
            'bg-pink-500': isOver,
          })}
        />
      </div>
    )
  );
}
