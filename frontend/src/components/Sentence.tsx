// src/components/Sentence.tsx
import React, { useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  question: string;
  options?: string[];
  selectedOrder?: string[];
  onPick?: (part: string) => void;
  onRemove?: (part: string) => void;
  onReorder?: (order: string[]) => void;
  onReset?: () => void;
}

function SortablePlacedItem({
  id,
  value,
  onClick,
}: {
  id: UniqueIdentifier;
  value: string;
  onClick?: (v: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
    zIndex: isDragging ? 40 : undefined,
    userSelect: "none",
    WebkitUserSelect: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        if (e.detail === 0) return;
        if (!isDragging && onClick) onClick(String(value));
      }}
      className={`p-3 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center gap-3 select-none ${
        isDragging ? "shadow-lg scale-[1.02]" : ""
      }`}
      role="listitem"
      aria-label={`선택된 단어 ${value}`}
    >
      <div className="text-sm font-medium text-gray-800 whitespace-pre">
        {value}
      </div>
    </div>
  );
}

function PoolItem({
  value,
  onAdd,
  disabled,
}: {
  value: string;
  onAdd: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onAdd(value)}
      disabled={disabled}
      aria-pressed={disabled}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition bg-white border border-gray-200 hover:bg-gray-50 whitespace-pre ${
        disabled
          ? "opacity-50 bg-gray-50 cursor-not-allowed text-gray-500"
          : "text-gray-800"
      }`}
    >
      <span className="text-sm font-medium">{value}</span>
    </button>
  );
}

const Sentence: React.FC<Props> = ({
  question,
  options = [],
  selectedOrder = [],
  onPick,
  onRemove,
  onReorder,
  onReset,
}) => {
  const [placed, setPlaced] = React.useState<string[]>(() =>
    selectedOrder ? selectedOrder.slice() : []
  );
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const mountedRef = useRef(false);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 0, tolerance: 5 },
    }),
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (!mountedRef.current) {
      setPlaced(selectedOrder ? selectedOrder.slice() : []);
      mountedRef.current = true;
      return;
    }
    setPlaced(selectedOrder ? selectedOrder.slice() : []);
  }, [selectedOrder]);

  const handleAdd = (word: string) => {
    if (placed.includes(word)) return;
    const next = [...placed, word];
    setPlaced(next);
    onPick?.(word);
    onReorder?.(next);
  };

  const handleRemove = (word: string) => {
    const next = placed.filter((p) => p !== word);
    setPlaced(next);
    onRemove?.(word);
    onReorder?.(next);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    const oldIndex = placed.indexOf(activeIdStr);
    const newIndex = placed.indexOf(overIdStr);
    if (oldIndex === -1 || newIndex === -1) return;
    if (oldIndex !== newIndex) {
      const next = arrayMove(placed, oldIndex, newIndex);
      setPlaced(next);
      onReorder?.(next);
    }
  };

  const handleReset = () => {
    setPlaced([]);
    onReset?.();
    onReorder?.([]);
  };

  const pool = options.slice();

  return (
    <div className="space-y-3">
      <div className="text-left">
        <h1 className="text-lg font-bold text-gray-800">
          문장을 올바른 순서로 배열하세요
        </h1>
      </div>

      <div className="w-full">
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100">
          <span className="text-sm text-gray-500">{question}</span>
        </div>
      </div>

      <div
        className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
        style={{ touchAction: "none" }}
      >
        <div className="text-xs text-gray-500 mb-2">선택된 순서</div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={placed}
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-[48px] flex flex-wrap gap-2" role="list">
              {placed.length === 0 ? (
                <div className="text-xs text-gray-400">
                  여기에 선택한 단어 조각이 표시됩니다
                </div>
              ) : (
                placed.map((part) => (
                  <SortablePlacedItem
                    key={part}
                    id={part}
                    value={part}
                    onClick={handleRemove}
                  />
                ))
              )}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 160 }}>
            {activeId ? (
              <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-lg flex items-center gap-3 scale-[1.01]">
                <div className="text-sm font-medium text-gray-800 whitespace-pre">
                  {String(activeId)}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="mt-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            초기화
          </button>
        </div>
      </div>

      {/* pool: flex로 변경, 카드 너비는 콘텐츠에 맞춰 자동 조정 */}
      <div className="flex flex-wrap gap-2">
        {pool.map((part, idx) => {
          const disabled = placed.includes(part);
          return (
            <PoolItem
              key={`${part}-${idx}`}
              value={part}
              onAdd={handleAdd}
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Sentence;
