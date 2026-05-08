"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type WidgetConfig = {
  id: string;
  title: string;
  component: ReactNode;
};

type Props = {
  widgets: WidgetConfig[];
  storageKey?: string;
};

function SortableWidget({ id, children }: { id: string; children: ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "cursor-grabbing z-50" : "cursor-grab"}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

export function SortableWidgets({ widgets: initialWidgets, storageKey = "dashboard-widgets" }: Props) {
  const [order, setOrder] = useState<string[]>(() => initialWidgets.map((w) => w.id));
  const [isHydrated, setIsHydrated] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadOrder = () => {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const savedIds = JSON.parse(stored) as string[];
          const allIds = initialWidgets.map((w) => w.id);
          const validIds = savedIds.filter((id) => allIds.includes(id));
          const remaining = allIds.filter((id) => !savedIds.includes(id));
          setOrder([...validIds, ...remaining]);
        } catch {
          // use default order
        }
      }
      setIsHydrated(true);
    };
    loadOrder();
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        try {
          localStorage.setItem(storageKey, JSON.stringify(newOrder));
        } catch {
          // ignore storage errors
        }
        return newOrder;
      });
    }
  }, [storageKey]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-4">
        {initialWidgets.map((widget) => (
          <div key={widget.id}>{widget.component}</div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4">
          {order.map((id) => {
            const widget = initialWidgets.find((w) => w.id === id);
            if (!widget) return null;
            return (
              <SortableWidget key={widget.id} id={widget.id}>
                {widget.component}
              </SortableWidget>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}