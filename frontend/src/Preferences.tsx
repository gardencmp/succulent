import { Switch } from '@/components/ui/switch';
// import {
//   DndContext,
//   useDroppable,
//   useDraggable,
//   DragOverlay,
//   useSensors,
//   useSensor,
//   PointerSensor,
// } from '@dnd-kit/core';
// import { Draggable } from "./lib/dragAndDrop";
// import { useState } from "react";
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from '@/components/SortableItem';

export const insightTypes = [
  'profileVisits',
  'impressions',
  'totalInteractions',
  'reach',
  'likes',
  'comments',
  'saved',
  'shares',
  'follows',
  'profileActivity',
];

export function Preferences() {
  const [items, setItems] = useState([1, 2, 3]);
  const [postPreferences, setPostPreferences] = useState(insightTypes);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div>
      <p>😒</p>
      <h3>Post Prefs:</h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {insightTypes.map((id) => (
            <>
              <Switch />
              <SortableItem key={id} id={id} label={id} />
            </>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}
