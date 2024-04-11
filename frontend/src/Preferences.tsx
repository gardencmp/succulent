import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
] as const;

export function Preferences() {
  const [items, setItems] = useState([1, 2, 3]);
  const [postPreferences, setPostPreferences] = useState<
    (typeof insightTypes)[number][]
  >([]);

  useEffect(() => {
    const storedPrefs = localStorage.getItem('postPreferences');
    storedPrefs
      ? setPostPreferences(JSON.parse(storedPrefs))
      : setPostPreferences([...insightTypes]);
  }, []);

  useEffect(() => {
    localStorage.setItem('postPreferences', JSON.stringify(postPreferences));
  }, [postPreferences]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCheckedChange = (id: (typeof insightTypes)[number]) => {
    const swithActive = postPreferences.includes(id);
    if (swithActive) {
      const filteredPrefs = postPreferences.filter((prefId) => prefId !== id);
      setPostPreferences(filteredPrefs);
    } else {
      setPostPreferences(postPreferences.concat(id));
    }
  };

  return (
    <>
      <p>😒</p>
      <h3>Post Prefs:</h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {insightTypes.map((id) => (
            <div className="flex">
              <Switch
                key={`switch-${id}`}
                className="m-1"
                checked={postPreferences.includes(id)}
                onCheckedChange={() => handleCheckedChange(id)}
              />
              <SortableItem
                key={id}
                id={id}
                label={id}
                className="flex items-center"
              />
            </div>
          ))}
        </SortableContext>
      </DndContext>
    </>
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || !active) return;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(Number(active.id));
        const newIndex = items.indexOf(Number(over.id));

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}
