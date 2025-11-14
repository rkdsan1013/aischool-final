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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  question: string;
  options?: string[];
  selectedOrder?: string[];
  onPick?: (part: string) => void;
  onRemove?: (part: string) => void;
  onReorder?: (order: string[]) => void;
}

// 공통 텍스트 스타일: 카드 너비는 내용에 맞게 자동, 줄바꿈 금지로 높이 변화 방지
const CARD_TEXT_CLASS =
  "text-base font-medium whitespace-nowrap overflow-hidden";

function SortablePlacedItem({
  id,
  value,
  onRemove,
}: {
  id: UniqueIdentifier;
  value: string;
  onRemove?: (v: string) => void;
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && e.detail > 0 && onRemove) {
      onRemove(String(value));
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      role="listitem"
      aria-label={`선택된 단어 ${value}`}
      className={`flex-none rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 shadow-sm flex items-center select-none cursor-grab active:cursor-grabbing ${
        isDragging ? "shadow-lg scale-[1.03] z-50" : ""
      }`}
    >
      {/* inline-flex으로 너비가 내용에 맞게 결정되며 padding으로 카드 크기 보정 */}
      <div
        className={`inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 ${CARD_TEXT_CLASS}`}
      >
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
      className={`flex-none text-left rounded-2xl transition-all duration-200 inline-flex items-center ${
        disabled ? "cursor-not-allowed" : "hover:shadow-md active:scale-95"
      } ${
        disabled
          ? "bg-gray-100 text-gray-400 border border-gray-200"
          : "bg-white border border-gray-200 text-foreground"
      }`}
    >
      <div
        className={`inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 ${CARD_TEXT_CLASS}`}
      >
        {value}
      </div>
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
}) => {
  const [placed, setPlaced] = React.useState<string[]>(() =>
    selectedOrder ? selectedOrder.slice() : []
  );
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const mountedRef = useRef(false);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
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

  const pool = options.slice();

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          문장 배열하기
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          단어들을 올바른 순서로 배열하여 문장을 완성하세요.
        </p>
      </div>

      <div className="w-full">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-6">
          <span className="text-lg sm:text-xl font-medium text-foreground">
            {question}
          </span>
        </div>
      </div>

      {/* 배열된 단어 영역: 충분한 여유 높이로 레이아웃 고정. 카드 너비는 내용 기반 */}
      <div
        className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5"
        style={{ touchAction: "none" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-muted-foreground">
            배열된 문장
          </span>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={placed}
            strategy={horizontalListSortingStrategy}
          >
            {/* min-h를 넉넉하게 잡아 항목 추가로 인한 부모 레이아웃 변화 억제 */}
            <div
              className="min-h-[88px] sm:min-h-[88px] flex items-center gap-2 overflow-x-auto py-2"
              role="list"
            >
              <div
                className="flex items-center gap-2"
                style={{ flexWrap: "nowrap" }}
              >
                {placed.length === 0 ? (
                  <div className="flex items-center h-[56px] sm:h-[56px] text-muted-foreground text-sm px-2">
                    아래의 단어를 선택하거나 드래그하여 문장을 만드세요.
                  </div>
                ) : (
                  placed.map((part) => (
                    <SortablePlacedItem
                      key={part}
                      id={part}
                      value={part}
                      onRemove={handleRemove}
                    />
                  ))
                )}
                <div aria-hidden style={{ width: 12 }} />
              </div>
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 160 }}>
            {activeId ? (
              <div className="rounded-2xl bg-white border-2 border-rose-400 shadow-lg flex items-center select-none scale-[1.03]">
                <div
                  className={`inline-flex items-center px-4 py-2 sm:px-5 sm:py-3 ${CARD_TEXT_CLASS}`}
                >
                  {String(activeId)}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap gap-2 sm:gap-3">
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
    </div>
  );
};

export default Sentence;
